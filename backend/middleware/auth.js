const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Project = require('../models/Project');

async function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, token missing.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token invalid.' });
  }
}

async function requireProjectMember(req, res, next) {
  try {
    const projectId = req.params.id || req.params.projectId;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const isMember =
      project.owner.toString() === req.user._id.toString() ||
      project.members.some((memberId) => memberId.toString() === req.user._id.toString());

    if (!isMember) {
      return res.status(403).json({ message: 'Project membership required.' });
    }

    req.project = project;
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Project authorization failed.', error: error.message });
  }
}

module.exports = {
  protect,
  requireProjectMember,
};
