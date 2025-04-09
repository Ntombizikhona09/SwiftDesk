import React from 'react';
 
const Profile = () => {
  const user = { name: 'Your Name', image: 'your-profile-picture.jpg' };
 
  return (
<div className="profile">
<img src={user.image} alt="Profile" />
<p>{user.name}</p>
</div>
  );
};
 
export default Profile;