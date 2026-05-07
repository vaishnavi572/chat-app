const upload = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "chat-app");

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/de3nabta5/image/upload",
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();

  if (!res.ok) {
    console.log("Cloudinary error:", data);
    throw new Error(data.error?.message || "Upload failed");
  }

  return data.secure_url;
};

export default upload;