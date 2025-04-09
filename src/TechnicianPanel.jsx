import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { collection, getDocs, query, where, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { Smile, Mic, Plus, Send } from 'lucide-react';
import { signOut } from 'firebase/auth';
import './message.css';

const Messages = () => {
  const [senders, setSenders] = useState([]);  // List of senders
  const [selectedSender, setSelectedSender] = useState(null);  // Selected sender
  const [messages, setMessages] = useState([]);  // Messages of the selected sender
  const [replyMessage, setReplyMessage] = useState("");  // Technician's reply message
  const [showSmileMenu, setShowSmileMenu] = useState(false);  // To toggle emoji menu
  const [selectedEmoji, setSelectedEmoji] = useState(null);  // Selected emoji
  const [loading, setLoading] = useState(true);  // For loading state

  const employeeNo = "123456";  // Replace with the employeeNo of the logged-in technician

  // Fetch all the senders who have sent messages to the technician
  useEffect(() => {
    const fetchSenders = async () => {
      const q = query(
        collection(db, "queries"),
        where("receiverEmployeeNo", "==", employeeNo)  // Messages where technician is the receiver
      );

      const querySnapshot = await getDocs(q);
      const sendersList = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Add the sender's employee number to the senders list
        if (!sendersList.some(sender => sender.employeeNo === data.senderEmployeeNo)) {
          sendersList.push({
            employeeNo: data.senderEmployeeNo,
            senderName: data.senderName,
            senderEmail: data.senderEmail,
          });
        }
      });
      setSenders(sendersList);
      setLoading(false);
    };

    fetchSenders();
  }, [employeeNo]);

  // Fetch messages for the selected sender
  const fetchMessages = async (senderEmployeeNo) => {
    setLoading(true);
    const q = query(
      collection(db, "queries"),
      where("senderEmployeeNo", "==", senderEmployeeNo),
      where("receiverEmployeeNo", "==", employeeNo)
    );

    const querySnapshot = await getDocs(q);
    const conversation = [];
    querySnapshot.forEach((doc) => {
      conversation.push({ id: doc.id, ...doc.data() });
    });
    setMessages(conversation);
    setLoading(false);
  };

  // Handle sender selection
  const handleSenderSelect = (sender) => {
    setSelectedSender(sender);
    fetchMessages(sender.employeeNo);  // Fetch messages for the selected sender
  };

  // Handle reply
  const handleReply = async () => {
    if (replyMessage.trim() !== "") {
      try {
        const newMessage = {
          senderEmployeeNo: employeeNo,  // Technician's employee number
          receiverEmployeeNo: selectedSender.employeeNo,  // Sender's employee number
          message: replyMessage,
          timestamp: serverTimestamp(),
          emoji: selectedEmoji || null,
        };

        // Add reply to Firestore (queries collection)
        const newMessageRef = doc(db, "queries", selectedSender.employeeNo);
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
          {/* List of senders */}
          <h2>Senders</h2>
          {loading ? (
            <p>Loading...</p>
          ) : senders.length === 0 ? (
            <p>No messages available.</p>
          ) : (
            <div className="sender-list">
              {senders.map((sender) => (
                <div
                  key={sender.employeeNo}
                  className="sender-item"
                  onClick={() => handleSenderSelect(sender)}  // Display conversation when clicked
                >
                  <div>{sender.senderName}</div>
                  <div>{sender.senderEmail}</div>
                </div>
              ))}
            </div>
          )}

          {/* Show conversation if a sender is selected */}
          {selectedSender && (
            <div className="conversation-section">
              <h2>Conversation with {selectedSender.senderName}</h2>
              {loading ? (
                <p>Loading conversation...</p>
              ) : (
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
              )}

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
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
