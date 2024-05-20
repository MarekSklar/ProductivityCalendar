import imageToBase64 from 'image-to-base64';

export default defineEventHandler(async (event) => {
    const { databaseFilePath } = useRuntimeConfig();
    const body = await readBody(event);
    
    return imageToBase64(body.path);    
});