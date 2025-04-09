import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { collection, getDocs, query, where, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { Smile, Mic, Plus, Send } from 'lucide-react';
import { signOut } from 'firebase/auth';
import './message.css';

const Messages = () => {
  const [senders, setSenders] = useState([]);
  const [selectedSender, setSelectedSender] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyMessage, setReplyMessage] = useState("");
  const [showSmileMenu, setShowSmileMenu] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState(null);

  // Assuming technician's employeeNo is available
  const employeeNo = "123456";  // Replace with the employeeNo of the logged-in technician

  // Fetch Sent Messages from Firebase (Queries collection)
  useEffect(() => {
    const fetchSentMessages = async () => {
      const q = query(
        collection(db, "queries"),
        where("EmployeeNo", "==", employeeNo)  // Use employeeNo to filter sent messages
      );

      const querySnapshot = await getDocs(q);
      const sentMessages = [];
      querySnapshot.forEach((doc) => {
        sentMessages.push({ id: doc.id, ...doc.data() });
      });

      setMessages(sentMessages);
    };

    if (employeeNo) {
      fetchSentMessages();
    }
  }, [employeeNo]);

  // Handle Reply
  const handleReply = async () => {
    if (replyMessage.trim() !== "") {
      try {
        const newMessage = {
          EmployeeNo: employeeNo,  // Send technician's employee number
          technicianId: selectedSender,
          message: replyMessage,
          timestamp: serverTimestamp(),
          emoji: selectedEmoji || null,
        };

        // Add reply to Firestore (queries collection)
        const newMessageRef = doc(db, "queries", selectedSender);
        await updateDoc(newMessageRef, newMessage);

        // Update messages state
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setReplyMessage(""); // Clear input
        setSelectedEmoji(null); // Reset emoji
      } catch (error) {
        console.error("Error replying to message:", error);
      }
    }
  };

  // Handle sender selection
  const handleSenderSelect = (employeeNo) => {
    setSelectedSender(employeeNo);
    fetchMessages(employeeNo); // Fetch messages for selected sender
  };

  // Fetch messages for a selected sender (if required)
  const fetchMessages = async (employeeNo) => {
    const querySnapshot = await getDocs(collection(db, "queries"));
    const conversation = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.EmployeeNo === employeeNo || data.technicianId === employeeNo) {
        conversation.push({ id: doc.id, ...data });
      }
    });
    setMessages(conversation);
  };

  // Logout function
  const logOut = () => {
    signOut(auth)
      .then(() => {
        window.location.href = "/login";
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  return (
    <div className="messages-container">
      <div className="sidebar">
        <h2 className="logo">Messages</h2>
        <nav>
          <ul>
            <li><a href="/technician-dashboard">Dashboard</a></li>
            <li><a href="/messages">Messages</a></li>
            <li><a onClick={logOut}>Log Out</a></li>
          </ul>
        </nav>
      </div>

      <div className="main-content">
        <header className="header">
          <h1>Messages</h1>
        </header>

        <div className="message-thread">
          <h2>Sent Messages</h2>
          <div className="messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message-bubble ${msg.senderEmployeeNo === employeeNo ? 'technician' : 'user'}`}
              >
                <div>{msg.message}</div>
                {msg.emoji && <span className="emoji">{msg.emoji}</span>}
              </div>
            ))}
          </div>

          {/* Reply Section */}
          <div className="reply-section">
            <div className="icon-buttons">
              <button onClick={() => setShowSmileMenu(!showSmileMenu)}>
                <Smile size={24} />
              </button>
              <button><Mic size={24} /></button>
              <button><Plus size={24} /></button>
            </div>

            {showSmileMenu && (
              <div className="emoji-menu">
                {['😀', '😅', '😂', '😍', '😎', '😜', '😭', '😊', '🤔', '😇'].map((emoji, index) => (
                  <button key={index} onClick={() => setReplyMessage(prev => prev + emoji)}>
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            <div className="message-input-container">
              <textarea
                placeholder="Type your reply..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
              />
              <button className="send-button" onClick={handleReply}>
                <Send size={20} /> Send Reply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
