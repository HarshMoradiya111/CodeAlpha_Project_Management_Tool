const express = require('express');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const { protect } = require('../middleware/auth');

const router = express.Router();

function serializeTask(task) {
  return {
    id: task._id,
    project: task.project,
    title: task.title,
    description: task.description,
    assignee: task.assignee,
    status: task.status,
    comments: task.comments,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      {
        ...(req.body.title !== undefined ? { title: req.body.title } : {}),
        ...(req.body.description !== undefined ? { description: req.body.description } : {}),
        ...(req.body.assignee !== undefined ? { assignee: req.body.assignee } : {}),
        ...(req.body.status !== undefined ? { status: req.body.status } : {}),
      },
      { new: true }
    );

    return res.json(serializeTask(updatedTask));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update task.', error: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    await Comment.deleteMany({ task: task._id });
    await task.deleteOne();

    return res.json({ message: 'Task deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete task.', error: error.message });
  }
});

router.post('/:id/comments', protect, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Comment text is required.' });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const comment = await Comment.create({
      task: task._id,
      user: req.user._id,
      text,
    });

    task.comments.push(comment._id);
    await task.save();

    return res.status(201).json(comment);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to add comment.', error: error.message });
  }
});

module.exports = router;
