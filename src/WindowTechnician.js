// MessageWindow Component (simplified)
import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';  // Import auth for getting the technicianId
import { collection, getDocs, where, query, addDoc, serverTimestamp, orderBy } from 'firebase/firestore'; // Import orderBy
import { useParams } from 'react-router-dom';  // To handle URL parameters
import './messageWindow.css';

const MessageWindow = () => {
  const [messages, setMessages] = useState([]);
  const [replyMessage, setReplyMessage] = useState("");
  const { employeeNo } = useParams();  // Get the selected employee's number
  const [technicianId, setTechnicianId] = useState(null);  // State to store technician's ID

  // Fetch technicianId dynamically from Firebase Auth (replace with actual logic to get logged-in user's ID)
  useEffect(() => {
    const fetchTechnicianId = async () => {
      const user = auth.currentUser;  // Get the current authenticated user
      if (user) {
        setTechnicianId(user.uid);  // Set the technician's ID
      } else {
        console.error("User is not authenticated");
      }
    };

    fetchTechnicianId();
  }, []);

  // Fetch chat history when the window is loaded
  useEffect(() => {
    if (technicianId && employeeNo) {
      const fetchMessages = async () => {
        const q = query(
          collection(db, "queries"),
          where("senderEmployeeNo", "==", employeeNo),
          where("receiverEmployeeNo", "==", technicianId),
          orderBy("timestamp", "asc")  // Ensure the messages are ordered by timestamp
        );

        const querySnapshot = await getDocs(q);
        const messageList = [];
        querySnapshot.forEach((doc) => {
          messageList.push({ id: doc.id, ...doc.data() });
        });

        setMessages(messageList);
      };

      fetchMessages();
    }
  }, [employeeNo, technicianId]);

  // Handle the reply
  const handleReply = async () => {
    if (replyMessage.trim() !== "" && technicianId) {
      try {
        const newMessage = {
          senderEmployeeNo: technicianId,
          receiverEmployeeNo: employeeNo,
          message: replyMessage,
          timestamp: serverTimestamp(),
          reply: true,  // Mark this as a reply
        };

        // Add message to Firestore
        const messagesRef = collection(db, "queries");
        await addDoc(messagesRef, newMessage);

        // Update local state to show new message
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setReplyMessage(""); // Clear input
      } catch (error) {
        console.error("Error replying to message:", error);
      }
    }
  };

  // Show loading while fetching messages or technician ID
  if (!technicianId) {
    return <p>Loading technician data...</p>;
  }

  return (
    <div className="message-window">
      <h2>Conversation with Employee {employeeNo}</h2>
      <div className="messages">
        {messages.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={msg.senderEmployeeNo === technicianId ? "technician" : "user"}>
              <div>{msg.message}</div>
            </div>
          ))
        )}
      </div>

      <div className="reply-section">
        <textarea
          placeholder="Type your reply..."
          value={replyMessage}
          onChange={(e) => setReplyMessage(e.target.value)}
        />
        <button onClick={handleReply}>Send Reply</button>
      </div>
    </div>
  );
};

export default MessageWindow;
