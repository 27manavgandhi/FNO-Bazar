import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  setDoc,
} from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const FavouritesContext = createContext();

export const FavouritesProvider = ({ children }) => {
  const [favourites, setFavourites] = useState([]);
  const [selectedFavouriteTab, setSelectedFavouriteTab] = useState("");
  const db = getFirestore();
  const { currentUser } = useAuth();
  useEffect(() => {
    const fetchFavourites = async () => {
      if (!currentUser) return; // Ensure user is authenticated

      const userDocRef = doc(db, "users_favourites", currentUser.uid);
      const favouritesCollectionRef = collection(userDocRef, "favourites");

      getDocs(favouritesCollectionRef).then((querySnapshot) => {
        const favouritesData = querySnapshot.docs.map((doc) => ({
          id: doc.data().tab.toLowerCase().split(" ").join(""), // Generate the id by joining lowercase tab values together
          label: doc.data().tab, // Assuming the 'tab' field contains the label
        }));
        // console.log(favouritesData);
        setFavourites(favouritesData);
      });
    };

    fetchFavourites();
  }, [currentUser, db]);
  const addFavourite = async (component) => {
    setFavourites((prevFavourites) => [...prevFavourites, component]);
    const userDocRef = doc(
      db,
      "users_favourites",
      currentUser.uid,
      "favourites",
      component.label
    );
    await setDoc(userDocRef, {
      tab: component.label,
    });
  };

  const removeFavourite = async (component) => {
    // Remove the component from state
    setFavourites((prevFavourites) =>
      prevFavourites.filter((fav) => fav.id !== component.id)
    );
    // Remove the corresponding document from Firestore
    const userDocRef = doc(
      db,
      "users_favourites",
      currentUser.uid,
      "favourites",
      component.label
    );

    await deleteDoc(userDocRef);
  };

  const favouritesContextValue = {
    selectedFavouriteTab,
    setSelectedFavouriteTab,
    favourites,
    addFavourite,
    removeFavourite,
  };

  return (
    <FavouritesContext.Provider value={favouritesContextValue}>
      {children}
    </FavouritesContext.Provider>
  );
};

export const useFavourites = () => useContext(FavouritesContext);
