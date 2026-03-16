const mongoose = require('mongoose');

const faultSchema = new mongoose.Schema({
    Motor: Boolean,
    Battery: Boolean,
    Charger: Boolean,
    Controller: Boolean,
    DC_DCConverter: Boolean,
    VCU: Boolean,
    Telematics: Boolean,
    Cluster: Boolean,
    GearBox: Boolean,
    GearBoxController: Boolean,
    HeadLight: Boolean,
    TurnIndicator: Boolean,
    HandBrake: Boolean,
    Brake: Boolean,
    Accelerator: Boolean,
  });
  
  // Define a schema for the vehicle
  const faultCodeSchema = new mongoose.Schema({
    role: String,
    date: Date,
    dealer: String,
    accessToken: String,
    dealerToken: String,
    vehicleNo: String,
    vehicleType: String,
    motorType: String,
    batteryKW: String,
    location: String,
    condition: String,
    faultCode: faultSchema 
  });
  
  // Create a model based on the vehicle schema
  const FaultCodes = mongoose.model('FaultCode', faultCodeSchema);
  module.exports = FaultCodes;