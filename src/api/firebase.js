// src/api/firebase.js
import {
  collection,
  getDocs,
  deleteDoc,
  addDoc,
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

export const approveRequest = async (request) => {
  try {
    await addDoc(collection(db, "approvedBooks"), request);
    await deleteRequest(request.id);
  } catch (error) {
    console.error("Error approving request:", error);
    throw error;
  }
};

export const rejectRequest = async (request) => {
  try {
    await addDoc(collection(db, "declinedBooks"), request);
    await deleteRequest(request.id);
  } catch (error) {
    console.error("Error rejecting request:", error);
    throw error;
  }
};
