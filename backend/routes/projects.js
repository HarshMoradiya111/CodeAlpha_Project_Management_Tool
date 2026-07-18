const express = require('express');
const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

const router = express.Router();

function serializeProject(project) {
  return {
    id: project._id,
    name: project.name,
    owner: project.owner,
    members: project.members,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

function emitProjectEvent(req, projectId, event, payload) {
  req.app.locals.io?.to(projectId.toString()).emit(event, payload);
}

router.post('/', protect, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required.' });
    }

    const project = await Project.create({
      name,
      owner: req.user._id,
      members: [req.user._id],
    });

    return res.status(201).json(serializeProject(project));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create project.', error: error.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    }).sort({ createdAt: -1 });

    return res.json(projects.map(serializeProject));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch projects.', error: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const isMember =
      project.owner._id.toString() === req.user._id.toString() ||
      project.members.some((member) => member._id.toString() === req.user._id.toString());

    if (!isMember) {
      return res.status(403).json({ message: 'Project membership required.' });
    }

    return res.json(serializeProject(project));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch project.', error: error.message });
  }
});

router.post('/:id/invite', protect, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'User email is required.' });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project owner can invite members.' });
    }

    const invitedUser = await User.findOne({ email: email.toLowerCase() });

    if (!invitedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!project.members.some((memberId) => memberId.toString() === invitedUser._id.toString())) {
      project.members.push(invitedUser._id);
      await project.save();
    }

    return res.json({ message: 'Member invited successfully.', project: serializeProject(project) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to invite member.', error: error.message });
  }
});

router.post('/:id/tasks', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const isMember =
      project.owner.toString() === req.user._id.toString() ||
      project.members.some((memberId) => memberId.toString() === req.user._id.toString());

    if (!isMember) {
      return res.status(403).json({ message: 'Project membership required.' });
    }

    const { title, description, assignee, status } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Task title is required.' });
    }

    const task = await Task.create({
      project: project._id,
      title,
      description: description || '',
      assignee: assignee || null,
      status: status || 'todo',
    });

    emitProjectEvent(req, project._id, 'task-created', {
      task: {
        id: task._id,
        project: task.project,
        title: task.title,
        description: task.description,
        assignee: task.assignee,
        status: task.status,
        comments: task.comments,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      },
    });

    return res.status(201).json({
      id: task._id,
      project: task.project,
      title: task.title,
      description: task.description,
      assignee: task.assignee,
      status: task.status,
      comments: task.comments,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create task.', error: error.message });
  }
});

module.exports = router;
