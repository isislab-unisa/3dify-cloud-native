import AWS from 'aws-sdk';
import fs from 'fs';

type Body = {
  file: any;
  filename: string;
  type: string;
};

const testLocalSave = (fileName: string, buffer: Buffer) => {
  // Define the directory where you want to save the file locally
  const localDirectory = './uploads';

  // Create the local directory if it doesn't exist
  if (!fs.existsSync(localDirectory)) {
    fs.mkdirSync(localDirectory, { recursive: true });
  }

  // Write the file to the local directory
  const localFilePath = `${localDirectory}/${fileName}`;

  // Write the buffer to a file
  fs.writeFileSync(localFilePath, buffer);
};

export async function POST(req: Request) {
  try {
    const s3 = new AWS.S3({
      region: 'localhost',
      endpoint: 'http://filestore:9000',
      accessKeyId: 'admin',
      secretAccessKey: 'minioadmin',
      s3ForcePathStyle: true, // Required for MinIO
    });

    const body: Body = await req.json();
    const file: any = body.file;
    const fileName = body.filename;
    const fileType = body.type;
  
    // Remove the data URL prefix (e.g. "data:image/jpeg;base64,")
    const base64String = file.replace(/^data:[a-z]+\/[a-z]+;base64,/, '');

    // Convert base64 string to buffer
    const buffer = Buffer.from(base64String, 'base64');

    // Create bucket with the name of the file
    const bucketName: string = fileName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');

    const bucketExists = await s3
      .headBucket({ Bucket: bucketName })
      .promise()
      .then(() => true)
      .catch(() => false);

      if (!bucketExists) {
      await s3.createBucket({ Bucket: bucketName }).promise();
    }

    // Upload file to the created bucket
    await s3
      .upload({
        Bucket: bucketName,
        Key: `${fileName}`,
        Body: buffer,
        ContentType: fileType,
      })
      .promise();

    return Response.json({ message: 'File uploaded successfully' });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: 'Failed to upload file' });
  }
};
