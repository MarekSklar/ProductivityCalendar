import imageToBase64 from 'image-to-base64';

export default defineEventHandler(async (event) => {
    try {
    const body = await readBody(event);
    if(body.path)
        return imageToBase64(body.path);    
    else
        return;
    } catch(error) {

    }
});