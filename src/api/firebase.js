// src/api/firebase.js
import {
  collection,
  getDocs,
  getDoc,
  deleteDoc,
  addDoc,
  doc,
  updateDoc,
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

// src/api/firebase.js
// src/api/firebase.js

// Fetch a specific request by ID
export const fetchRequestById = async (requestId) => {
  try {
    let requestDoc;

    // Check in bookRequests collection
    console.log(`Fetching from bookRequests with ID: ${requestId}`);
    requestDoc = await getDoc(doc(db, "bookRequests", requestId));
    if (requestDoc.exists()) {
      console.log("Found in bookRequests:", requestDoc.data());
      return { id: requestDoc.id, ...requestDoc.data(), status: "pending" };
    }

    // Check in approvedBooks collection
    console.log(`Fetching from approvedBooks with ID: ${requestId}`);
    requestDoc = await getDoc(doc(db, "approvedBooks", requestId));
    if (requestDoc.exists()) {
      console.log("Found in approvedBooks:", requestDoc.data());
      return { id: requestDoc.id, ...requestDoc.data(), status: "approved" };
    }

    // Check in declinedBooks collection
    console.log(`Fetching from declinedBooks with ID: ${requestId}`);
    requestDoc = await getDoc(doc(db, "declinedBooks", requestId));
    if (requestDoc.exists()) {
      console.log("Found in declinedBooks:", requestDoc.data());
      return { id: requestDoc.id, ...requestDoc.data(), status: "declined" };
    }

    throw new Error("Request not found");
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
// src/api/firebase.js

// Approve a request and move it to the approvedBooks collection
export const approveRequest = async (requestId) => {
  try {
    const requestDoc = await getDoc(doc(db, "bookRequests", requestId));
    if (!requestDoc.exists()) {
      throw new Error("Request not found");
    }

    const requestData = requestDoc.data();

    // Preparar el documento aprobado, eliminando el campo `id`
    const approvedRequest = {
      ...requestData,
      approvedAt: new Date(), // Puedes agregar un campo de tiempo si es necesario
    };
    delete approvedRequest.id;

    // Agregar el documento a la colección `approvedBooks`
    await addDoc(collection(db, "approvedBooks"), approvedRequest);

    // Eliminar el documento de la colección `bookRequests`
    await deleteDoc(doc(db, "bookRequests", requestId));
  } catch (error) {
    console.error("Error approving request:", error);
    throw error;
  }
};

// Reject a request and move it to the declinedBooks collection
export const rejectRequest = async (requestId, rejectionReason) => {
  try {
    const requestDoc = await getDoc(doc(db, "bookRequests", requestId));
    if (!requestDoc.exists()) {
      throw new Error("Request not found");
    }

    const requestData = requestDoc.data();

    // Añadir comentario de rechazo al documento
    const declinedRequest = {
      ...requestData,
      rejectionReason,
    };

    // Agregar el documento a la colección `declinedBooks`
    await addDoc(collection(db, "declinedBooks"), declinedRequest);

    // Eliminar el documento de la colección `bookRequests`
    await deleteDoc(doc(db, "bookRequests", requestId));
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
    const requestRef = doc(db, "bookRequests", requestId);
    await updateDoc(requestRef, {
      status: "observations",
      observations: observations,
    });
    console.log("Observations sent successfully.");
  } catch (error) {
    console.error("Error sending observations:", error);
    throw error;
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
    const requestRef = doc(db, "bookRequests", requestId);
    await updateDoc(requestRef, {
      [`fieldStatus.${fieldName}`]: status,
      [`comments.${fieldName}`]: comment,
    });
    console.log("Field status updated successfully.");
  } catch (error) {
    console.error("Error updating field status:", error);
    throw error;
  }
};

// Fetch all data from newPublisherRequest and publishers collections
export const fetchAllPublisherData = async () => {
  try {
    const [newPublisherRequestsSnapshot, publishersSnapshot] =
      await Promise.all([
        getDocs(collection(db, "newPublisherRequest")),
        getDocs(collection(db, "publishers")),
      ]);

    const newPublisherRequests = newPublisherRequestsSnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() })
    );
    const publishers = publishersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { newPublisherRequests, publishers };
  } catch (error) {
    console.error("Error fetching publisher data:", error);
    throw error;
  }
};

// Check for duplicate publisher data
export const checkDuplicatePublisherData = async ({
  name,
  razonSocial,
  email,
}) => {
  try {
    const { newPublisherRequests, publishers } = await fetchAllPublisherData();

    const allEntries = [...newPublisherRequests, ...publishers];

    const nameExists = name
      ? allEntries.some((entry) => entry.name === name)
      : false;
    const razonSocialExists = razonSocial
      ? allEntries.some((entry) => entry.razonSocial === razonSocial)
      : false;
    const emailExists = email
      ? allEntries.some((entry) => entry.email === email)
      : false;

    return {
      nameExists,
      razonSocialExists,
      emailExists,
    };
  } catch (error) {
    console.error("Error checking duplicate publisher data:", error);
    throw error;
  }
};

// Fetch all rejected requests
export const fetchRejectedRequests = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "declinedBooks"));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching rejected requests:", error);
    throw error;
  }
};

// Fetch approved requests
export const fetchApprovedRequests = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "approvedBooks"));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching approved requests:", error);
    throw error;
  }
};

// Fetch declined requests
export const fetchDeclinedRequests = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "declinedBooks"));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching declined requests:", error);
    throw error;
  }
};

// woocommerce.js
