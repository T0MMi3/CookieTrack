const { storage, Firestore } = require('../firebaseConfig'); 
const admin = require('firebase-admin');

async function createDoc(file, userId) {
  try {
    const bucket = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET);
    const filePath = `users/${userId}/documents/${file.originalname}`;
    const fileRef = bucket.file(filePath);

    // Set the cache expiration to 1 year
    const fileMetadata = {
      cacheControl: 'public, max-age=31536000',
    };

    // Save the file buffer to the bucket
    await fileRef.save(file.buffer, fileMetadata);

    // Retrieve metadata (file size & creation time)
    const [metadata] = await fileRef.getMetadata();
    const fileSize = metadata.size; // Size in bytes
    const uploadTime = metadata.timeCreated; // Upload timestamp

    // Set expiration data to one year after today
    const expirationDate = new Date();
    expirationDate.setUTCFullYear(expirationDate.getUTCFullYear() + 1);

    // Generate a signed URL for downloading the file
    const [downloadURL] = await fileRef.getSignedUrl({
      action: 'read',
      expires: expirationDate,
    });

    // Update the user's document field in Firestore
    const userRef = Firestore.collection('users').doc(userId);
    await userRef.update({
      documents: admin.firestore.FieldValue.arrayUnion({
        name: file.originalname,
        url: downloadURL,
        size: fileSize,
        dateUploaded: new Date(uploadTime).toLocaleDateString("en-US"),
      }),
    });

    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

async function createProfilePic(file, userId) {
  try {
    const bucket = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET);
    const folderPath = `users/${userId}/profilePic/`;
    const filePath = `${folderPath}${file.originalname}`;
    const fileRef = bucket.file(filePath);

    // Delete all existing files in the profilePic folder
    const [files] = await bucket.getFiles({ prefix: folderPath });
    const deletePromises = files.map((file) => file.delete());
    await Promise.all(deletePromises);

    // Set the cache expiration to 1 year
    const fileMetadata = {
      cacheControl: 'public, max-age=31536000',
    };

    // Save the file buffer to the bucket
    await fileRef.save(file.buffer, fileMetadata);

    // Set expiration data to one year after today
    const expirationDate = new Date();
    expirationDate.setUTCFullYear(expirationDate.getUTCFullYear() + 1);

    // Generate a signed URL for downloading the file
    const [downloadURL] = await fileRef.getSignedUrl({
      action: 'read',
      expires: expirationDate,
    });

    // Update the user's profilePic field in Firestore
    const userRef = Firestore.collection('users').doc(userId);
    await userRef.update({
      profilePic: downloadURL,
    });

    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

async function createRewardImg(file, rewardId) {
  try {
    const bucket = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET);
    const folderPath = `rewards/${rewardId}/`;
    const filePath = `${folderPath}${file.originalname}`;
    const fileRef = bucket.file(filePath);

    // Delete all existing files in the rewards folder for a specific reward
    const [files] = await bucket.getFiles({ prefix: folderPath });
    const deletePromises = files.map((file) => file.delete());
    await Promise.all(deletePromises);

    // Set the cache expiration to 1 year
    const fileMetadata = {
      cacheControl: 'public, max-age=31536000',
    };

    // Save the file buffer to the bucket
    await fileRef.save(file.buffer, fileMetadata);

    // Set expiration data to one year after today
    const expirationDate = new Date();
    expirationDate.setUTCFullYear(expirationDate.getUTCFullYear() + 1);

    // Generate a signed URL for downloading the file
    const [downloadURL] = await fileRef.getSignedUrl({
      action: 'read',
      expires: expirationDate,
    });

    // Update the rewards downloadUrl field in Firestore
    const rewardRef = Firestore.collection('rewards').doc(rewardId);
    await rewardRef.update({
      downloadUrl: downloadURL,
    });

    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

async function deleteDoc(userId, fileName) {
  try {
    const bucket = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET);
    const fileRef = bucket.file(`users/${userId}/documents/${fileName}`);

    // Delete the file from the bucket
    await fileRef.delete();

    // Update the user's document field in Firestore
    const userRef = Firestore.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error('User document not found');
    }

    const userData = userDoc.data();
    const updatedDocuments = userData.documents.filter(doc => doc.name !== fileName);

    // Update Firestore with the new documents array
    if (updatedDocuments.length === 0) {
      // Remove the 'documents' key entirely if no documents remain
      await userRef.update({
        documents: admin.firestore.FieldValue.delete(),
      });
    } else {
      // Otherwise, update the documents array
      await userRef.update({
        documents: updatedDocuments,
      });
    }

    return { message: 'Document deleted successfully' };
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}

async function deleteRewardImg(rewardId) {
  try {
    const bucket = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET);
    const folderPath = `rewards/${rewardId}/`;

    // List all files in the folder
    const [files] = await bucket.getFiles({ prefix: folderPath });

    if (files.length === 0) {
      console.log('No files found for this reward.');
      return { message: 'No files found for this reward.' };
    }

    // Delete all files
    await Promise.all(files.map(file => file.delete()));

    return { message: 'Reward images deleted successfully' };
  } catch (error) {
    console.error('Error deleting reward images:', error);
    throw error;
  }
}

async function saveDocMeta(userId, { name, url, size, dateUploaded }) {
  try {
    const userRef = Firestore.collection('users').doc(userId);
    await userRef.update({
      documents: admin.firestore.FieldValue.arrayUnion({ name, url, size, dateUploaded }),
    });
    return { message: 'Metadata saved' };
  } catch (error) {
    console.error('Error saving document metadata:', error);
    throw error;
  }
}

async function saveProfilePicMetaService(userId, url) {
  const userRef = Firestore.collection('users').doc(userId);
  await userRef.update({ profilePic: url });
  return { message: 'Profile pic metadata saved' };
}

async function saveRewardImgMetaService(rewardId, downloadUrl) {
  const rewardRef = Firestore.collection('rewards').doc(rewardId);
  await rewardRef.update({ downloadUrl });
  return { message: 'Reward image metadata saved' };
}

module.exports = { createDoc, createProfilePic, createRewardImg, deleteDoc, deleteRewardImg, saveDocMeta, saveProfilePicMetaService, saveRewardImgMetaService };