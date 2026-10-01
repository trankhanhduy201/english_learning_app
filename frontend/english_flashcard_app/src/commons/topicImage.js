import { API_BASE_URL } from "../configs/apiConfig";

export const DEFAULT_TOPIC_IMAGE_SRC = "/default_image.jpeg";

export const getTopicImageSrc = (imageInfo) => {
  const imageUrl = imageInfo?.url;
  if (!imageUrl) {
    return DEFAULT_TOPIC_IMAGE_SRC;
  }

  return imageUrl.startsWith("http") ? imageUrl : `${API_BASE_URL}${imageUrl}`;
};
