import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "../firebase";

const storage = getStorage(app);

export const uploadFile = async (file, folder = "quiz-uploads") => {
  try {
    const uniqueName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `${folder}/${uniqueName}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error("Upload file error:", error);
    throw error;
  }
};