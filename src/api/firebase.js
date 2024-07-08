// src/api/firebase.js
import {
  collection,
  getDocs,
  getDoc,
  deleteDoc,
  addDoc,
  doc,
  updateDoc,
  getFirestore,
} from "firebase/firestore";
import { db } from "@/firebase";

// Fetch all book requests
export const fetchRequests = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "bookRequests"));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching requests:", error);
    throw error;
  }
};

// Fetch a specific request by ID
export const fetchRequestById = async (requestId) => {
  try {
    const requestDoc = await getDoc(doc(db, "bookRequests", requestId));
    if (requestDoc.exists()) {
      return requestDoc.data();
    } else {
      throw new Error("Request not found");
    }
  } catch (error) {
    console.error("Error fetching request:", error);
    throw error;
  }
};

// Update the status of a request
export const updateRequestStatus = async (requestId, status) => {
  try {
    const docRef = doc(db, "bookRequests", requestId);
    await updateDoc(docRef, { status });
  } catch (error) {
    console.error("Error updating request status:", error);
    throw error;
  }
};

// Archive a request
export const archiveRequest = async (requestId) => {
  try {
    const docRef = doc(db, "bookRequests", requestId);
    await updateDoc(docRef, { status: "archived" });
  } catch (error) {
    console.error("Error archiving request:", error);
    throw error;
  }
};

// Approve a specific field of a request
export const approveField = async (requestId, field) => {
  try {
    const docRef = doc(db, "bookRequests", requestId);
    await updateDoc(docRef, { [`fields.${field}.status`]: "approved" });
  } catch (error) {
    console.error("Error approving field:", error);
    throw error;
  }
};

// Reject a specific field of a request with a comment
export const rejectField = async (requestId, field, comment) => {
  try {
    const docRef = doc(db, "bookRequests", requestId);
    await updateDoc(docRef, {
      [`fields.${field}.status`]: "rejected",
      [`fields.${field}.comment`]: comment,
    });
  } catch (error) {
    console.error("Error rejecting field:", error);
    throw error;
  }
};

// Delete a request
export const deleteRequest = async (requestId) => {
  try {
    await deleteDoc(doc(db, "bookRequests", requestId));
  } catch (error) {
    console.error("Error deleting request:", error);
    throw error;
  }
};

// Approve a request and move it to the approvedBooks collection
export const approveRequest = async (request) => {
  try {
    await addDoc(collection(db, "approvedBooks"), request);
    await deleteRequest(request.id);
  } catch (error) {
    console.error("Error approving request:", error);
    throw error;
  }
};

// Reject a request and move it to the declinedBooks collection
export const rejectRequest = async (request) => {
  try {
    await addDoc(collection(db, "declinedBooks"), request);
    await deleteRequest(request.id);
  } catch (error) {
    console.error("Error rejecting request:", error);
    throw error;
  }
};

// Fetch all publisher requests
export const fetchPublisherRequests = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "newPublisherRequest"));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching publisher requests:", error);
    throw error;
  }
};

// Delete a publisher request
export const deletePublisherRequest = async (requestId) => {
  try {
    await deleteDoc(doc(db, "newPublisherRequest", requestId));
  } catch (error) {
    console.error("Error deleting publisher request:", error);
    throw error;
  }
};

// Send observations for a request
export const sendObservations = async (requestId, observations) => {
  try {
    const db = getFirestore();
    const requestRef = doc(db, "bookRequests", requestId);
    await updateDoc(requestRef, {
      status: "observations",
      observations: observations,
    });
    console.log("Observations sent successfully.");
  } catch (error) {
    console.error("Error sending observations:", error);
  }
};

// Update the status of a specific field with a comment
export const updateFieldStatus = async (
  requestId,
  fieldName,
  status,
  comment
) => {
  try {
    const db = getFirestore();
    const requestRef = doc(db, "bookRequests", requestId);
    await updateDoc(requestRef, {
      [`fieldStatus.${fieldName}`]: status,
      [`comments.${fieldName}`]: comment,
    });
    console.log("Field status updated successfully.");
  } catch (error) {
    console.error("Error updating field status:", error);
  }
};
