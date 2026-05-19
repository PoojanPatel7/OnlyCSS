import { db } from '../firebase/config';
import { doc, getDoc, updateDoc, collection, getDocs, writeBatch } from 'firebase/firestore';

export const POINTS = {
  LIKE: 5,
  SAVE: 10,
  DOWNLOAD: 15,
  FOLLOW: 20,
  UPLOAD: 50
};

export const getRankFromPoints = (points) => {
  if (points >= 5000) return 'diamond';
  if (points >= 2000) return 'platinum';
  if (points >= 500) return 'gold';
  if (points >= 100) return 'silver';
  return 'bronze';
};

export const updateUserPoints = async (userId, pointsDelta) => {
  if (!userId || pointsDelta === 0) return;

  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const currentPoints = userSnap.data().rankPoints || 0;
      const newPoints = Math.max(0, currentPoints + pointsDelta); // Prevent negative points
      const newTier = getRankFromPoints(newPoints);
      
      await updateDoc(userRef, {
        rankPoints: newPoints,
        rankTier: newTier
      });
    }
  } catch (err) {
    console.error("Error updating user points:", err);
  }
};

export const recalculateAllUserPoints = async () => {
  try {
    console.log("Starting global point recalculation...");
    const usersSnap = await getDocs(collection(db, 'users'));
    const stylesSnap = await getDocs(collection(db, 'styles'));
    
    // Group styles by author
    const authorStats = {};
    stylesSnap.forEach(styleDoc => {
      const style = styleDoc.data();
      const authorId = style.authorId;
      if (!authorId) return;
      
      if (!authorStats[authorId]) {
        authorStats[authorId] = { uploads: 0, likes: 0, saves: 0, downloads: 0 };
      }
      
      authorStats[authorId].uploads += 1;
      authorStats[authorId].likes += (style.likesCount || 0);
      authorStats[authorId].saves += (style.savedBy?.length || 0);
      authorStats[authorId].downloads += (style.downloadsCount || 0);
    });

    const batch = writeBatch(db);
    let updateCount = 0;

    usersSnap.forEach(userDoc => {
      const user = userDoc.data();
      const userId = userDoc.id;
      
      const followersCount = user.followers?.length || user.followersCount || 0;
      const stats = authorStats[userId] || { uploads: 0, likes: 0, saves: 0, downloads: 0 };
      
      const totalPoints = 
        (followersCount * POINTS.FOLLOW) +
        (stats.uploads * POINTS.UPLOAD) +
        (stats.likes * POINTS.LIKE) +
        (stats.saves * POINTS.SAVE) +
        (stats.downloads * POINTS.DOWNLOAD);
        
      const newTier = getRankFromPoints(totalPoints);
      
      batch.update(doc(db, 'users', userId), {
        rankPoints: totalPoints,
        rankTier: newTier
      });
      
      updateCount++;
    });

    if (updateCount > 0) {
      await batch.commit();
      console.log(`Successfully recalculated points for ${updateCount} users.`);
    }
    return updateCount;
  } catch (err) {
    console.error("Error recalculating points:", err);
    throw err;
  }
};
