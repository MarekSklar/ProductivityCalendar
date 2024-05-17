import path from 'path'
import fs from 'fs'
import resizeImg from 'resize-img';

export default defineEventHandler(async (event) => {
  const fileForm = await readMultipartFormData(event);
  const file = fileForm?.at(0);
  if(file === undefined)
    return;

  const format = file.filename?.split('.').pop();
  if(format === 'jpg' || format === 'png')
  {
    const id = Date.now();

    const filePath = path.join(
      process.cwd(),
      'profilePics',
      (id.toString() + '.' + format) as string,
    );

    fs.writeFileSync(filePath, file.data);
    const image256 = await resizeImg(fs.readFileSync(filePath), {
      width: 256,
      height: 256
    });
    
    const image48 = await resizeImg(fs.readFileSync(filePath), {
      width: 48,
      height: 48
    });

    fs.writeFileSync(path.join(process.cwd(), 'profilePics', ('256_' + id.toString() + '.' + format) as string), image256);
    fs.writeFileSync(path.join(process.cwd(), 'profilePics', ('48_' + id.toString() + '.' + format) as string), image48);
    fs.unlinkSync(filePath);

    return filePath;
  }
  else
  {
      return;
  }  
});