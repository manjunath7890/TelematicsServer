const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
  user: String,
  v1: String,
  v2: String,
  v3: String,
  v4: Number,
  v5: Number,
  v6: Number,
  v7: Number,
  v8: Number,
  v9: Number,
  v10: Number,
  v11: Number,
  v12: Number,
  v13: Number,
  v14: Number,
  v15: Number,
  v16: Number,
  v17: Number,
  v18: Number,
  v19: Number,
  v20: Number,
  v21: Number,
  v22: Number,
  v23: Number,
  v24: Number,
  v25: Number,
  v26: Number,
  v27: Number,
  v28: Number,
  v29: Number,
  v30: Number,
  v31: Number,
  v32: Number,
  v33: Number,
  v34: Number,
  v35: Number,
  v36: Number,
  v37: Number,
  v38: Number,
  v39: Number,
  v40: Number,
  v41: Number,
  v42: Number,
  v43: Number,
  v44: Number,
  v45: Number,
  v46: Number,
  v47: Number,
  v48: Number,
  v49: Number,
  v50: Number,
  v51: Number,
  v52: Number,
  v53: Number,
  v54: Number,
  v55: Number,
  v56: Number,
  v57: Number,
  v58: Number,
  v59: Number,
  v60: Number,
  v61: Number,
  v62: Number,
  v63: Number,
  v64: Number,
  v65: Number,
  v66: Number,
  v67: Number,
  v68: Number,
  v69: Number,
  v70: Number,
  v71: Number,
  v72: Number,
  v73: Number,
  date: {
    type: Date,
    default: () => new Date().toISOString().slice(0, 10)
  },
  timestamp: {
    type: Date,
  },
});

dataSchema.set('toJSON', { getters: true });

const Data = mongoose.model('Data', dataSchema);
module.exports = Data;
