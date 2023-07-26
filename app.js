const express = require("express");
const faceapi = require("face-api.js");
const mongoose = require("mongoose");
const { Canvas, Image } = require("canvas");
const canvas = require("canvas");
const fileUpload = require("express-fileupload");
const dataUriToBuffer = require("data-uri-to-buffer");
const app = express();
faceapi.env.monkeyPatch({ Canvas, Image });
const bodyParser = require('body-parser');
const port = 4000


app.use(bodyParser.json());

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// ########## schema ##############
const userSchema = new mongoose.Schema({
    label: {
      type: String,
    },
    profilePic: {
      type: String,
    },
    descriptions: [mongoose.Schema.Types.Mixed],
  });
  
  const UserModel = mongoose.model('faceapis', userSchema); // Using 'faceapis' collection
  
  //   dates schema 
  const pointageSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "faceapis"
    }, 
    date : {
        type : Date
    }
  })
  const PointageModel = mongoose.model('Pointage', pointageSchema); 
  

// Rest of the code remains the same
async function LoadModels() {
  await faceapi.nets.faceRecognitionNet.loadFromDisk(__dirname + "/models");
  await faceapi.nets.faceLandmark68Net.loadFromDisk(__dirname + "/models");
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(__dirname + "/models");
}
LoadModels();

app.use(fileUpload({ useTempFiles: true }));

app.post("/post", async (req, res) => {
  let u = dataUriToBuffer("data:image/jpg;base64," + req.body.photo);
  try {
    const img = await canvas.loadImage(u);
    const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
    const descriptions = [];
    for (let i = 1; i <= 3; i++) {
      descriptions.push(detections.descriptor);
    }

    // Check if data exists for the label in MongoDB
    const existingData = await UserModel.findOne({ label: req.body.label });

    if (existingData) {
      // Data already exists, update the record
      existingData.descriptions = descriptions;
      existingData.dateCreation = finDate;
      await existingData.save();
      console.log("Data updated in MongoDB successfully!");
    } else {
      // Data does not exist, create a new record
      const date_ob = new Date();
      const finDate = formatDate(date_ob);

      const faceApiData = new UserModel({
        label: req.body.label,
        descriptions: descriptions,
        dateCreation: finDate,
        attendancetime: [], // Initialize the attendancetime array as empty
        logtime: [], // Initialize the logtime array as empty
      });

      await faceApiData.save();
      console.log("Data saved to MongoDB successfully!");
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/stat", async (req, res) => {
  if (req.body.filee.length != 4) {
    let u = dataUriToBuffer("data:image/jpg;base64," + req.body.filee);

    // Retrieve data from MongoDB
    try {
      const reponsee = await UserModel.find();
      if (!reponsee || reponsee.length === 0) {
        console.log("No data found in MongoDB");
        return res.send({ oyo: "prob" });
      }

      // Create the faces array in the correct format
      const faces = reponsee.map((data) => {
        const descriptors = data.descriptions.map((desc) => Float32Array.from(Object.values(desc)));
        if (typeof data.label !== "string") {
          throw new Error("Invalid label found in MongoDB");
        }
        return new faceapi.LabeledFaceDescriptors(data.label, descriptors);
      });

      const faceMatcher = new faceapi.FaceMatcher(faces, 0.6);
      const img = await canvas.loadImage(u);

      const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();
      const resizedDetections = faceapi.resizeResults(detections, { width: img.width, height: img.height });

      const results = resizedDetections.map((d) => faceMatcher.findBestMatch(d.descriptor));
      if (results[0] === undefined || results[0].label === "unknown") {
        res.send({ oyo: "prob" });
      } else {
        res.send({ aya: results[0].label });

        const date_ob = new Date();
        const finDate = formatDate(date_ob);
        const finTime = formatTime(date_ob);

        try {
          await UserModel.updateOne(
            { label: results[0].label },
            { $set: { dernierPointage: finDate }, $push: { attendancetime: finDate, logtime: finTime } }
          );
        } catch (err) {
          console.error("Error updating data in MongoDB:", err);
        }
      }
    } catch (err) {
      console.error("Error retrieving data from MongoDB:", err);
      res.send({ oyo: "prob" });
    }
  } else res.send({ aya: "oww" });
});

// Helper function to format the date
function formatDate(date) {
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
}

// Helper function to format the time
function formatTime(date) {
  const hours = ("0" + date.getHours()).slice(-2);
  const minutes = ("0" + date.getMinutes()).slice(-2);
  const seconds = ("0" + date.getSeconds()).slice(-2);
  return `${hours}:${minutes}:${seconds}`;
}

// Close MongoDB connection when the server is stopped
process.on("SIGINT", () => {
  mongoose.connection.close(() => {
    console.log("MongoDB connection closed");
    process.exit(0);
  });
});

app.post('/api/users', async (req, res) => {
  const newUser = req.body;
  if (!newUser) {
    return res.status(400).json({ message: 'pls provide the user' });
  }
  try {
    const user = await UserModel.create(newUser);
    console.log('user created', user);
    return res.status(201).json({ message: 'user created', user });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'utilisateur:', error);
    return res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'utilisateur' });
  }
});

app.get('/api/users/:_id', async (req, res) => {
  const _id = req.params._id;
  try {
    const user = await UserModel.findById(_id); // Using `findById` instead of `findOneById`
    if (!user) {
      return res.status(404).json({ message: 'User Not Found' });
    }
    console.log('user found : ', user);
    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ message: 'An Error Occured' });
  }
});

app.patch('/api/users/:_id', async (req, res) => {
  const _id = req.params._id;
  const updates = req.body;

  if (!updates) {
    return res.status(404).json({ message: 'Please provide the updates' });
  }
  try {
    const user = await UserModel.findByIdAndUpdate(
      _id, // Using `findByIdAndUpdate` instead of `findOneAndUpdate`
      { ...updates },
      {
        new: true,
      }
    );
    if (!user) {
      return res.status(404).json({ message: 'User Not Found' });
    }
    console.log('user updated : ', user);
    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ message: 'An Error Occured' });
  }
});

// Route pour supprimer un utilisateur par name
app.delete('/api/users/:_id', async (req, res) => {
  const _id = req.params._id;
  console.log('_id is : ', _id);
  try {
    const userDeleted = await UserModel.findByIdAndDelete(_id);
    if (!userDeleted) {
      return res.status(400).json({ message: 'User Not Found' });
    }
    console.log('user deleted:  ', userDeleted);
    return res.json({ message: 'User removed Successfully', user: userDeleted });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    return res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur' });
  }
});

// Route pour obtenir la liste des utilisateurs
app.get('/api/users', async (req, res) => {
  try {
    const users = await UserModel.find();
    res.json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});


// pointage routes----------
// create pointage
app.post("/api/pointage", async (req, res )=> {
    const {userId} = req.body
    try{
        const pointage = await PointageModel.create({
            userId, 
            date : new Date().toISOString()
        })
        console.log("pointage created : ", pointage)
        return res.status(201).json({message : `pointage ${userId} is done!`})
    }catch(error){
        return res.status(500).json({message : `an error occured`})
    }
})

app.get("/api/pointage", async (req, res)=> {
    const { search_date } = req.query
    console.log("search date : ", search_date)
    const startDate = new Date(new Date(search_date).setHours(0,0,0,0)).toISOString()
    const endDate = new Date(new Date(search_date).setHours(23,59,59,999)).toISOString()
    console.log(`start : ${startDate}, end : ${endDate}`)
    try {
        const users = await PointageModel.find({
            date : {
                $gt : startDate, 
                $lt : endDate
            }
        }).populate("user", "-descriptions")
        console.log("users : ", users)
        return res.status(200).json({users})
    }catch(error){
        console.log(error)
        return res.status(500).json({message : `an error occured`})
    }
})

// Start the server
// Connect to MongoDB


async function start() {
    try {
      await mongoose.connect("mongodb+srv://wiss203:wiss203@cluster0.yfsy1ht.mongodb.net/face", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      app.listen(port, () =>
        console.log(`Server is listening on port ${port}...`)
      );
    } catch (error) {
      console.log(error);
    }
  }
  
  start();
  