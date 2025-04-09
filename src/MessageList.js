import React, { useEffect, useState } from 'react';
import { db, collection, getDocs, query, orderBy } from './firebase'; // Import Firestore functions

const MessageList = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const querySnapshot = await getDocs(
          query(collection(db, 'messages'), orderBy('createdAt', 'asc'))
        );
        const fetchedMessages = [];
        querySnapshot.forEach((doc) => {
          fetchedMessages.push(doc.data());
        });
        setMessages(fetchedMessages); // Update state with fetched messages
      } catch (error) {
        console.error("Error fetching messages: ", error);
      }
    };

    fetchMessages();
  }, []); // Empty array means the effect runs only once, when the component is mounted

  return (
    <div className="message-list">
      {messages.map((message, index) => (
        <div key={index} className="message">
          {message.type === 'text' ? (
            <p>{message.text}</p>
          ) : (
            <img src={message.text} alt="Uploaded" />
          )}
        </div>
      ))}
    </div>
  );
};

export default MessageList;
