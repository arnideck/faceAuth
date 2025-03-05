const API_BASE_URL = import.meta.env.VITE_LAMBDA_API_URL;

export async function analyzeFace(imageBase64) {
    const response = await fetch(`${API_BASE_URL}/faceRekognition`, {
        method: "POST",
        body: JSON.stringify({ image: imageBase64 }),
        headers: { "Content-Type": "application/json" },
    });
    return response.json();
}

export async function uploadImage(imageBase64) {
    const response = await fetch(`${API_BASE_URL}/uploadToS3`, {
        method: "POST",
        body: JSON.stringify({ image: imageBase64 }),
        headers: { "Content-Type": "application/json" },
    });
    return response.json();
}

export async function saveToDynamo(fileName, bucket) {
    const response = await fetch(`${API_BASE_URL}/saveToDynamo`, {
        method: "POST",
        body: JSON.stringify({ fileName, bucket }),
        headers: { "Content-Type": "application/json" },
    });
    return response.json();
}
