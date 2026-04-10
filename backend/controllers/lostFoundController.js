// ================================
// FILE: backend/controllers/lostFoundController.js
// ================================
const LostFound = require('../models/LostFound');

exports.createReport = async (req, res) => {
  try {
    const report = await LostFound.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const { type, status } = req.query;
    let query = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const reports = await LostFound.find(query)
      .populate('userId', 'name phone email')
      .populate('petId', 'name type breed photos')
      .sort('-createdAt');
      
    res.json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getReport = async (req, res) => {
  try {
    const report = await LostFound.findById(req.params.id)
      .populate('userId', 'name phone email')
      .populate('petId');
      
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    let report = await LostFound.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (report.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    report.status = req.body.status || 'resolved';
    await report.save();
    
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
