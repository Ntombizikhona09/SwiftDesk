import React, { useState, useEffect, useRef } from "react";
import { Menu, User, Send, Smile, Plus, Mic } from "lucide-react";
import { setDoc, doc, collection, getDocs, serverTimestamp } from "firebase/firestore"; 
import { auth, db } from './firebase';  // Assuming firebase is correctly initialized
import { signOut } from "firebase/auth"; // Import signOut from Firebase
import './loginPage.css';

const EmployeeQueryPage = () => {
  const [queryType, setQueryType] = useState('');
  const [priorityLevel, setPriorityLevel] = useState('');
  const [message, setMessage] = useState('');
  const [messageHistory, setMessageHistory] = useState([]);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [showSmileMenu, setShowSmileMenu] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef(null);
  const messageEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const emojis = ["😀", "😅", "😂", "😍", "😎", "😜", "😭", "😊", "🤔", "😇"];

  // Fetch message history from Firestore when the component mounts
  useEffect(() => {
    const fetchMessages = async () => {
      const querySnapshot = await getDocs(collection(db, "queries"));
      const messages = [];
      querySnapshot.forEach((doc) => {
        messages.push(doc.data());
      });
      setMessageHistory(messages);
    };
    fetchMessages();
  }, []); 

  // Scroll to the latest message after message history updates
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageHistory]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };

  const handleSendMessage = async () => {
    if (message.trim() !== '' && queryType.trim() !== '' && priorityLevel.trim() !== '') {
      try {
        const techniciansSnapshot = await getDocs(collection(db, "technicians"));
        const technicians = [];
    
        techniciansSnapshot.forEach((doc) => {
          technicians.push({ id: doc.id, ...doc.data() });
        });
    
        if (technicians.length === 0) {
          alert("No available technicians at the moment.");
          return;
        }
    
        let assignedTechnician = technicians[0];
    
        technicians.forEach((technician) => {
          if (technician.assignedQueries < assignedTechnician.assignedQueries) {
            assignedTechnician = technician;
          }
        });
    
        const newQuery = {
          sender: "user",
          queryType,
          priorityLevel,
          text: message,
          file: filePreview || null,
          emoji: selectedEmoji || null,
          audio: audioBlob || null, 
          timestamp: serverTimestamp(),
          technicianId: assignedTechnician.id,
          status: "pending" 
        };
    
        await setDoc(doc(db, "queries", new Date().toISOString()), newQuery);
    
        const technicianRef = doc(db, "technicians", assignedTechnician.id);
        await setDoc(technicianRef, {
          assignedQueries: assignedTechnician.assignedQueries + 1
        }, { merge: true });
    
        setMessageHistory((prevHistory) => [...prevHistory, newQuery]);
    
        setQueryType('');
        setPriorityLevel('');
        setMessage('');
        setFile(null);
        setFilePreview(null);
        setSelectedEmoji(null);
        setAudioBlob(null); 
      } catch (error) {
        console.error("Error sending query:", error);
      }
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    audioChunksRef.current = [];
    
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        mediaRecorderRef.current = new MediaRecorder(stream);
        
        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };
        
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudioBlob(audioUrl);
        };
        
        mediaRecorderRef.current.start();
      })
      .catch((err) => console.error("Error accessing microphone: ", err));
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) { 
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      console.error("MediaRecorder is not initialized.");
    }
  };

  const handleSelectEmoji = (emoji) => {
    setMessage((prevMessage) => prevMessage + emoji);
    setSelectedEmoji(emoji);
    setShowSmileMenu(false); // Hide emoji menu after selection
  };

  const toggleSmileMenu = () => {
    setShowSmileMenu((prevState) => !prevState);
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const clearChat = () => {
    setMessageHistory([]); // Clear message history from state
  };

  const logOut = () => {
    signOut(auth)  // Use Firebase's signOut method to log the user out
      .then(() => {
        console.log("User logged out");
        window.location.href = "/login";  // Redirect to login page
      })
      .catch((error) => {
        console.error("Error logging out: ", error);
      });
  };

  return (
    <div className="employee-page">
      <aside className="sidebar">
        <User size={32} className="mt-4" />
      </aside>

      <div className="main-content">
        <header className="header">
          <h1>Swift Desk</h1>
          <Menu size={28} className="menu-icon" onClick={toggleMenu} />
          {showMenu && (
            <div className="dropdown-menu">
              <button onClick={clearChat}>Clear Chat</button>
              <button onClick={logOut}>Log Out</button>
            </div>
          )}
        </header>

        <section className="employee-form-container">
          <div className="employee-form">
            <h2>Employee Query</h2>

            <div className="input-field">
              <label>Select Query Type:</label>
              <input
                type="text"
                placeholder="Enter query type"
                value={queryType}
                onChange={(e) => setQueryType(e.target.value)}
              />
            </div>

            <div className="input-field">
              <label>Select Priority Level:</label>
              <div className="dropdown">
                <select
                  value={priorityLevel}
                  onChange={(e) => setPriorityLevel(e.target.value)}
                  className="dropdown-select"
                >
                  <option value="" disabled>Select Priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div className="chat-container">
              <div className="message-box">
                <div className="message-history">
                  {messageHistory.map((msg, index) => (
                    <div key={index} className={`message-bubble ${msg.sender === 'user' ? 'user' : 'respondent'}`}>
                      <div><strong>Query Type:</strong> {msg.queryType}</div>
                      <div><strong>Priority Level:</strong> {msg.priorityLevel}</div>
                      {msg.text.split('\n').map((line, i) => (
                        <div key={i}>{line}</div>
                      ))}
                      {msg.file && (
                        <div className="file-preview">
                          {msg.file.startsWith("blob") ? (
                            <img src={msg.file} alt="File preview" className="file-img" />
                          ) : (
                            <span>{msg.file}</span>
                          )}
                        </div>
                      )}
                      {msg.emoji && (
                        <div className="emoji-preview">
                          <span>{msg.emoji}</span>
                        </div>
                      )}
                      {msg.audio && (
                        <div className="audio-preview">
                          <audio controls src={msg.audio}></audio>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messageEndRef}></div>
                </div>
              </div>
            </div>

            <div className="message-input-container">
              <div className="icon-buttons">
                <button onClick={handleFileInputClick}>
                  <Plus size={24} />
                </button>
                <button onClick={toggleSmileMenu}>
                  <Smile size={24} />
                </button>
                <Mic
                  size={24}
                  className={`mic-icon ${isRecording ? "recording" : ""}`}
                  onClick={isRecording ? stopRecording : startRecording}
                />
              </div>

              {showSmileMenu && (
                <div className="emoji-menu">
                  {emojis.map((emoji, index) => (
                    <button key={index} onClick={() => handleSelectEmoji(emoji)}>
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              <input
                type="text"
                className="message-input"
                placeholder="Type a message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button className="send-button" onClick={handleSendMessage}>
                <Send size={20} />
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default EmployeeQueryPage;
