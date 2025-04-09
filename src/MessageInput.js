import React, { useState } from 'react';
import { db, addDoc, collection, Timestamp } from './firebase'; // Import necessary Firestore functions

const MessageInput = ({ sendMessage }) => {
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (input) {
      try {
        await addDoc(collection(db, 'messages'), {
          text: input,
          type: 'text', // or file if sending a file
          createdAt: Timestamp.fromDate(new Date()), // Store the timestamp
        });

        sendMessage(input); // Optional: if you want to update local state
        setInput(''); // Clear the input after sending
      } catch (error) {
        console.error("Error sending message: ", error);
      }
    }
  };

  return (
    <div className="message-input">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default MessageInput;
