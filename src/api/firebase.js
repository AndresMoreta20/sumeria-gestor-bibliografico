// src/api/firebase.js
import {
  collection,
  getDocs,
  getFirestore,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/firebase";

export const fetchRequests = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "bookRequests"));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching requests:", error);
    throw error;
  }
};

export const deleteRequest = async (requestId) => {
  try {
    await deleteDoc(doc(db, "bookRequests", requestId));
  } catch (error) {
    console.error("Error deleting request:", error);
    throw error;
  }
};

export const fetchPublisherRequests = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "newPublisherRequest"));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching publisher requests:", error);
    throw error;
  }
};

export const deletePublisherRequest = async (requestId) => {
  try {
    await deleteDoc(doc(db, "newPublisherRequest", requestId));
  } catch (error) {
    console.error("Error deleting publisher request:", error);
    throw error;
  }
};
