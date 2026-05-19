import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

export const createNotification = async ({
  userId,
  type,
  sourceUser,
  styleId = null,
  styleTitle = null
}) => {
  if (!userId || !sourceUser) return;

  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      type, // 'like', 'save', 'download', 'follow'
      sourceUserId: sourceUser.uid,
      sourceUserName: sourceUser.displayName || sourceUser.username || 'Someone',
      sourceUserPhoto: sourceUser.photoURL || null,
      styleId,
      styleTitle,
      createdAt: serverTimestamp(),
      read: false
    });

    // Prune old notifications to keep maximum 50
    const q = query(collection(db, 'notifications'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    if (snapshot.size > 50) {
      const docsList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort descending (newest first)
      docsList.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      
      // Delete any docs beyond the 50th
      const docsToDelete = docsList.slice(50);
      for (const d of docsToDelete) {
        try {
          await deleteDoc(doc(db, 'notifications', d.id));
        } catch (e) {
          console.error("Error deleting old notification:", e);
        }
      }
    }
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};
