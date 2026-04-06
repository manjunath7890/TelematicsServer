const express = require("express");
const cors = require("cors");
const cryptojs = require('crypto-js');
const fetch = require("node-fetch");
const nodemailer = require("nodemailer");
const router = express.Router();
// expressWs(router);

router.use(cors());

require("../db doc/atlas_conn");
const User = require("../model/userSchema");
const Vehicle = require("../model/registerSchema");
const Data = require("../model/dataSchema");
const SwitchData = require("../model/inputSchema");
const VehicleParts = require("../model/vehicleSchema");
const FaultCode = require("../model/faultCodeSchema");

// const client = require("../db doc/mqtt_conn");

const SECRET_KEY = process.env.CRYPTO_KEY || 'telematics_secure_local_storage_key';


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "AltenerSolutions2023@gmail.com",
    pass: "eglp flfk ayiz nzsn",
  },
});

let otps = {};

router.get("/", (req, res) => {
  res.send("server is running ..........");
});

// client.on("message", async (topic, message) => {
//   let messageString = message.toString();
//   messageString = messageString.replace(/\\+/g, "");
//   let messageObject;

//   try {
//     messageObject = JSON.parse(messageString);
//     // console.log(topic, messageString);
//   } catch (error) {
//     console.error("Error parsing JSON:", error);
//     return;
//   }
//   // });

//   if (topic === "vehicle_vcu_data") {
//     try {
//       const currentUTCDate = new Date();

//       const istTimestamp = new Date(
//         currentUTCDate.getTime() + 5.5 * 60 * 60 * 1000
//       );

//       const dataToInsert = {
//         ...messageObject,
//         timestamp: istTimestamp,
//       };

//       console.log(dataToInsert);
//       const data = new Data(dataToInsert);
//       await data.save();

//       console.log("Data saved");
//     } catch (error) {
//       console.error("Error saving data:", error);
//     }
//   }
// });

// client.on("error", (err) => {
//   console.error("MQTT connection error:", err);
// });

// client.on("reconnect", () => {
//   console.log("Reconnecting to MQTT broker...");
// });

// client.on("close", () => {
//   console.log("MQTT connection closed");
// });

router.get("/map-api/token", async (req, res) => {
  try {
    const response = await fetch(
      "https://outpost.mapmyindia.com/api/security/oauth/token?grant_type=client_credentials&client_id=96dHZVzsAusXufunsmHXQX3_xE8OBGDl6VenZXsIu5_TXmHzgO8Xj9RdedJCI_cDo8raZZ0Y365NdfByXGFxXA==&client_secret=lrFxI-iSEg_hu1BpgkuFEiDq75pyh7ZKFzVCynUKIsfBHyS5ODrDwFb6EllbVaCnbivb3kY7W0JKyiF3bGvqp13EgGGZuZDw",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    if (response.ok) {
      res.json(data);
    } else {
      res.status(response.status).json({ error: "Failed to get Map API" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/getTime", (req, res) => {
  const currentUTCDate = new Date();
  const hr = currentUTCDate.getHours();
  const min = currentUTCDate.getMinutes();
  const sec = currentUTCDate.getSeconds();
  const year = currentUTCDate.getFullYear();
  const month = currentUTCDate.getMonth();
  const date = currentUTCDate.getDate();
  res.status(200).json({ hr, min, sec, year, month, date });
});

router.get("/getdata", (req, res) => {
  const userName = req.query["user"];
  Data.findOne({ user: userName })
    .sort("-timestamp")
    .then((data) => {
      if (data) {
        res.json(data);
      } else {
        res.status(404).json({ error: "No data found" });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

router.post("/postdata", async (req, res) => {
  try {
    if (req.body) {
      const currentUTCDate = new Date();

      const istTimestamp = new Date(
        currentUTCDate.getTime() + 5.5 * 60 * 60 * 1000
      );

      const dataToInsert = {
        ...req.body,
        timestamp: istTimestamp,
      };

      const data = new Data(dataToInsert);
      await data.save();
      res.json(dataToInsert);
      // console.log("Data saved", dataToInsert);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "An error occurred while saving the data" });
  }
});

router.post("/signup", async (req, res) => {
  const {
    userName,
    role,
    email,
    contact,
    accessToken,
    dealerToken,
    financeToken,
    password,
  } = req.body;

  try {
    const newUser = await User.findOne({ email });

    if (newUser) {
      console.log("user already exist");
      return res.status(401).send({ message: "user already exist" });
    }

    const user = new User({
      userName,
      role,
      contact,
      email,
      accessToken,
      dealerToken,
      financeToken,
      password,
    });

    await user.save();

    console.log("user registered successfully!");
    return res.status(200).send({ message: "user registered successfully!" });
  } catch (err) {
    console.log(err);
  }
});

router.get("/api/documents", async (req, res) => {
  const { fileName, userName } = req.query;

  try {
    const document = await Data.findOne({
      user: userName,
      date: `${fileName}`,
    }).sort("-timestamp");

    if (!document) {
      return res
        .status(404)
        .json({ error: "No document found for the given date and user." });
    }
    res.json([document]);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.post("/register", async (req, res) => {
  const {
    vehicleNo,
    vehicleId,
    name,
    motorNo,
    chassiNo,
    batteryId,
    accessToken,
    financeToken,
  } = req.body;

  try {
    const newVehicle = await Vehicle.findOne({ vehicleId });

    if (newVehicle) {
      return res.status(401).send({ message: "vehicle already registered" });
    }

    const user = new Vehicle({
      vehicleNo,
      vehicleId,
      name,
      motorNo,
      chassiNo,
      batteryId,
      accessToken,
      financeToken,
    });
    await user.save();

    return res
      .status(200)
      .send({ message: "vechile registered successfully!" });
  } catch (err) {
    console.log(err);
  }
});

router.get("/vehicles", (req, res) => {
  Vehicle.find()
    .then((data) => {
      if (data && data.length > 0) {
        res.json(data);
      } else {
        res.status(404).json({ error: "No vehicles found" });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

router.get("/users", (req, res) => {
  User.find()

    .then((data) => {
      if (data && data.length > 0) {
        res.json(data);
      } else {
        res.status(404).json({ error: "No vehicles found" });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

router.get("/dealer/users", (req, res) => {
  const { dealerToken } = req.query;
  if (!dealerToken) {
    return res.status(400).json({ error: "dealerToken not provided" });
  }

  User.find({ dealerToken })
    .then((data) => {
      if (data && data.length > 0) {
        res.json(data);
      } else {
        res
          .status(404)
          .json({ error: "No users found for the provided dealerToken" });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

router.get("/fleet/vehicles", (req, res) => {
  const { accessToken } = req.query;
  if (!accessToken) {
    return res.status(400).json({ error: "accessToken not provided" });
  }

  Vehicle.find({ accessToken })
    .then((data) => {
      if (data && data.length > 0) {
        res.json(data);
      } else {
        res
          .status(404)
          .json({ error: "No vehicles found for the provided accessToken" });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

router.get("/dealer/vehicles", (req, res) => {
  const { dealerToken } = req.query;
  if (!dealerToken) {
    return res.status(400).json({ error: "dealerToken not provided" });
  }

  Vehicle.find({ dealerToken })
    .then((data) => {
      if (data && data.length > 0) {
        res.json(data);
      } else {
        res
          .status(404)
          .json({ error: "No vehicles found for the provided dealerToken" });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

router.get("/financer/vehicles", (req, res) => {
  const { financeToken } = req.query;
  if (!financeToken) {
    return res.status(400).json({ error: "financeToken not provided" });
  }

  Vehicle.find({ financeToken })
    .then((data) => {
      if (data && data.length > 0) {
        res.json(data);
      } else {
        res
          .status(404)
          .json({ error: "No vehicles found for the provided financeToken" });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  try {
    let decryptedPassword = password;
    try {
      const bytes = cryptojs.AES.decrypt(password, SECRET_KEY);
      const originalText = bytes.toString(cryptojs.enc.Utf8);
      if (originalText) {
        decryptedPassword = originalText;
      }
    } catch (e) {
      // Fallback: If decryption fails, it could be a plaintext password coming from Postman or an old client
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(decryptedPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.hasLegacyPlaintextPassword()) {
      user.password = decryptedPassword;
      await user.save();
    }

    res.status(200).json({
      message: 'User logged in successfully',
      role: user.role,
      accessToken: user.accessToken,
      dealerToken: user.dealerToken,
      financeToken: user.financeToken,
      name: user.userName,
      email: user.email,
      contact: user.contact,
    });
    console.log("Login Success");
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      otps[email] = otp;

      const mailOptions = {
        from: "AltenerSolutions2023@gmail.com",
        to: email,
        subject: "Password Reset OTP",
        text: `Your OTP for password reset is ${otp}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          res.status(500).json({ message: "Error sending email" });
        } else {
          console.log("Email sent: " + info.response);
          res.json({ message: "OTP sent to email" });
        }
      });
    } else {
      res.status(404).json({ message: "Email not found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error processing request" });
  }
});

router.post("/api/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  if (otps[email] === otp) {
    delete otps[email];
    res.json({ message: "OTP verified" });
  } else {
    res.status(400).json({ message: "Invalid OTP" });
  }
});

router.post("/api/reset-password", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      user.password = password;
      await user.save();
      res.json({ message: "Password reset successful" });
    } else {
      res.status(404).json({ message: "Email not found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error processing request" });
  }
});

router.post("/postinput", async (req, res) => {
  const { var1, var2, var3 } = req.body;

  try {
    let inputdata = await SwitchData.findOne({ var2: var2 });

    if (!inputdata) {
      inputdata = new SwitchData({ var1, var2, var3 });
      await inputdata.save();
      return res.status(201).json({ message: "Document created successfully" });
    }

    inputdata.var1 = var1;
    inputdata.var3 = var3;
    await inputdata.save();
    res.status(200).json({ message: "Document updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/api/brush", async (req, res) => {
  const { fileName, userName } = req.query;

  const data = await getDocument(fileName, userName);
  res.json(data);
});

const getDocument = async (date, user) => {
  try {
    const data = await Data.find({ date: date, user: user });
    return data;
  } catch (error) {
    console.error(error);
  }
};

router.get("/getinput", (req, res) => {
  const userName = req.query["user"];

  SwitchData.findOne({ var2: userName })
    .sort("-timestamp")
    .then((data) => {
      if (data) {
        res.json(data);
      } else {
        res.status(404).json({ error: "No data found" });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

router.get("/api/data", async (req, res) => {
  const { date, user, start, end } = req.query;

  try {
    const datePart = date;
    const parsedDate = new Date(datePart);
    if (isNaN(parsedDate.getTime())) {
      return res
        .status(400)
        .json({ error: "Invalid date format in fileName." });
    }
    const data = await getDataDocument(datePart, user, start, end);
    res.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

const getDataDocument = async (date, user, startTime, endTime) => {
  try {
    const startTimeUTC = new Date(`${date}T${startTime}:00Z`);
    const endTimeUTC = new Date(`${date}T${endTime}:00Z`);

    const startTimeAdjusted = new Date(startTimeUTC.getTime());
    const endTimeAdjusted = new Date(endTimeUTC.getTime());

    const data = await Data.find({
      date: date,
      user: user,
      timestamp: { $gte: startTimeAdjusted, $lte: endTimeAdjusted },
    })
      .sort({ timestamp: 1 })
      .limit(100000);

    return data;
  } catch (error) {
    console.error("Error in getDataDocument:", error);
    throw error;
  }
};

router.delete("/delete/data", async (req, res) => {
  const { user, start, end } = req.query;

  try {
    const query = {
      user: user,
      date: { $gte: start, $lte: end },
    };

    const result = await Data.deleteMany(query);

    res.json({
      message: "Data deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/user/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await User.deleteOne({ email: id });
    if (result.deletedCount === 1) {
      res.status(200).send({ message: "Document deleted successfully" });
    } else {
      res.status(404).send({ message: "Document not found" });
    }
  } catch (error) {
    res.status(500).send({ message: "Error deleting document", error });
  }
});

router.delete("/vehicle/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await Vehicle.deleteOne({ vehicleId: id });
    if (result.deletedCount === 1) {
      res.status(200).send({ message: "Document deleted successfully" });
    } else {
      res.status(404).send({ message: "Document not found" });
    }
  } catch (error) {
    res.status(500).send({ message: "Error deleting document", error });
  }
});

router.put("/user/update/:email", async (req, res) => {
  const { email } = req.params;
  const updatedUser = req.body;

  try {
    const user = await User.findOneAndUpdate({ email }, updatedUser, {
      new: true,
    });
    if (user) {
      res.json({ message: "User updated successfully", user });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/vehicle/update/:id", async (req, res) => {
  const { id } = req.params;
  const updatedVehicle = req.body;

  try {
    const vehicle = await Vehicle.findOneAndUpdate(
      { vehicleId: id },
      updatedVehicle,
      { new: true }
    );
    if (vehicle) {
      res.json({ message: "vehicle updated successfully", vehicle });
      console.log("updated");
    } else {
      res.status(404).json({ message: "vehicle not found" });
    }
  } catch (error) {
    console.error("Error updating vehicle:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/put/vehicleparts", async (req, res) => {
  const { chassisNumber } = req.body;
  try {
    const existingVehicle = await VehicleParts.findOne({ chassisNumber });
    if (existingVehicle) {
      await VehicleParts.updateOne({ chassisNumber }, req.body);
      res.status(200).json({ message: "Vehicle updated successfully" });
    } else {
      const newVehicle = new VehicleParts(req.body);
      await newVehicle.save();
      res.status(201).json({ message: "Vehicle created successfully" });
    }
  } catch (error) {
    console.error("Error creating/updating vehicle:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/get/vehicleparts/:chassisnumber", async (req, res) => {
  const { chassisnumber } = req.params;
  try {
    const existingVehicle = await VehicleParts.findOne({
      chassisNumber: chassisnumber,
    });
    if (!existingVehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    const partsMap = new Map();
    existingVehicle.parts.forEach((part) => {
      const existingPart = partsMap.get(part.partId);
      if (
        !existingPart ||
        new Date(part.dateInstalled) > new Date(existingPart.dateInstalled)
      ) {
        partsMap.set(part.partId, part);
      }
    });

    const latestParts = Array.from(partsMap.values());

    res.status(200).json({ ...existingVehicle._doc, parts: latestParts });
  } catch (error) {
    console.error("Error fetching vehicle data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete(
  "/delete/vehicleparts/:chassisNumber/:partId",
  async (req, res) => {
    try {
      const { chassisNumber, partId } = req.params;
      const vehicle = await VehicleParts.findOne({ chassisNumber });

      if (vehicle) {
        vehicle.parts = vehicle.parts.filter((part) => part.partId !== partId);
        await vehicle.save();
        res.status(200).json({ message: "Part deleted successfully" });
      } else {
        res.status(404).json({ message: "chassis number not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete the part", error });
    }
  }
);

router.put("/edit/vehicleparts/:chassisNumber/:partId", async (req, res) => {
  try {
    const { chassisNumber, partId } = req.params;
    const updatedPart = req.body;

    const vehicle = await VehicleParts.findOne({ chassisNumber });
    if (!vehicle) {
      return res.status(404).send("Vehicle not found");
    }

    const partIndex = vehicle.parts.findIndex((part) => part.partId === partId);
    if (partIndex === -1) {
      return res.status(404).send("Part not found");
    }

    vehicle.parts[partIndex] = { ...vehicle.parts[partIndex], ...updatedPart };
    await vehicle.save();

    res.send(vehicle);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get("/replace/vehicleparts/:chassisNumber/:partId", async (req, res) => {
  try {
    const { chassisNumber, partId } = req.params;

    const vehicle = await VehicleParts.findOne({ chassisNumber });
    if (!vehicle) {
      return res.status(404).send("Vehicle not found");
    }

    const partsWithSameId = vehicle.parts.filter(
      (part) => part.partId === partId
    );
    if (partsWithSameId.length === 0) {
      return res.status(404).send("No parts found with the specified partId");
    }

    res.send(partsWithSameId);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post("/faultcode", async (req, res) => {
  try {
    const newFaultCode = new FaultCode(req.body);

    // Check if a fault code entry already exists for the same vehicleNo and date
    const existingFaultCode = await FaultCode.findOne({
      vehicleNo: newFaultCode.vehicleNo,
      date: newFaultCode.date,
    });

    if (existingFaultCode) {
      return res
        .status(400)
        .json({
          message: "Fault code already exists for this vehicle and date",
        });
    }

    // Validate that faultCode is an object
    if (
      typeof newFaultCode.faultCode !== "object" ||
      newFaultCode.faultCode === null
    ) {
      return res.status(400).json({ message: "Fault code object is required" });
    }

    // Validate structure of the faultCode object
    const code = newFaultCode.faultCode;
    if (
      typeof code.Motor !== "boolean" || // Double-check this field name
      typeof code.Battery !== "boolean" ||
      typeof code.Charger !== "boolean" ||
      typeof code.Controller !== "boolean" ||
      typeof code.DC_DCConverter !== "boolean" ||
      typeof code.VCU !== "boolean" ||
      typeof code.Telematics !== "boolean" ||
      typeof code.Cluster !== "boolean" ||
      typeof code.GearBox !== "boolean" ||
      typeof code.GearBoxController !== "boolean" ||
      typeof code.HeadLight !== "boolean" ||
      typeof code.TurnIndicator !== "boolean" ||
      typeof code.HandBrake !== "boolean" ||
      typeof code.Brake !== "boolean" ||
      typeof code.Accelerator !== "boolean"
    ) {
      return res.status(400).json({ message: "Invalid fault code format" });
    }

    // Set default values if not provided
    newFaultCode.date = new Date(newFaultCode.date);
    newFaultCode.dealer = newFaultCode.dealer || "Unknown Dealer";
    newFaultCode.vehicleType =
      newFaultCode.vehicleType || "Unknown Vehicle Type";
    newFaultCode.motorType = newFaultCode.motorType || "Unknown Motor Type";
    newFaultCode.batteryKW = newFaultCode.batteryKW || "Unknown Battery kWatt";
    newFaultCode.location = newFaultCode.location || "Unknown Location";
    newFaultCode.condition = newFaultCode.condition || "Unknown Condition";
    newFaultCode.role = newFaultCode.role || "Unknown Role";
    newFaultCode.accessToken =
      newFaultCode.accessToken || "Unknown Access Token";
    newFaultCode.dealerToken =
      newFaultCode.dealerToken || "Unknown Dealer Token";
    newFaultCode.financeToken =
      newFaultCode.financeToken || "Unknown Finance Token";
    newFaultCode.vehicleNo = newFaultCode.vehicleNo || "Unknown Vehicle Number";

    await newFaultCode.save();

    res.status(201).json({ message: "Fault code saved successfully" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "An error occurred while saving the fault code" });
  }
});

router.get("/faultcode", async (req, res) => {
  const { role, start, end, dealerToken, accessToken } = req.query;

  try {
    const query = {};

    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    query.date = {
      $gte: startDate,
      $lte: endDate,
    };

    // Role-based filtering
    if (role === "admin") {
      // Admin can see all data within the date range
    } else if (role === "dealer") {
      if (!dealerToken) {
        return res.status(400).json({ message: "Missing dealerToken" });
      }
      query.dealerToken = dealerToken;
    } else if (role === "customer") {
      if (!accessToken) {
        return res.status(400).json({ message: "Missing accessToken" });
      }
      query.accessToken = accessToken;
    } else {
      return res
        .status(403)
        .json({ message: "Invalid role cannot access the data" });
    }

    const faultCodes = await FaultCode.find(query);

    if (!faultCodes || faultCodes.length === 0) {
      return res.status(404).json({ message: "No fault codes found" });
    }

    res.status(200).json(faultCodes);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching fault codes" });
  }
});

router.put("/faultcode/:id", async (req, res) => {
  const { id } = req.params;
  const updatedFaultCode = req.body;

  try {
    const faultCode = await FaultCode.findByIdAndUpdate(id, updatedFaultCode, {
      new: true,
    });
    if (faultCode) {
      res.json({ message: "Fault code updated successfully", faultCode });
    } else {
      res.status(404).json({ message: "Fault code not found" });
    }
  } catch (error) {
    console.error("Error updating fault code:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/faultcode/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await FaultCode.findByIdAndDelete(id);
    if (result) {
      res.status(200).json({ message: "Fault code deleted successfully" });
    } else {
      res.status(404).json({ message: "Fault code not found" });
    }
  } catch (error) {
    console.error("Error deleting fault code:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/postdatta", async (req, res) => {
  console.log(req.body);
  res.status(200).send(`message: ${req.body}`);
});

module.exports = router;
