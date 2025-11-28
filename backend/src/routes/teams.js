const express = require('express');
const router = express.Router();
const { 
  getAllTeams, 
  getTeam, 
  createTeam, 
  updateTeam, 
  deleteTeam,
  assignEmployeeToTeam,
  removeEmployeeFromTeam
} = require('../controllers/teamController');

router.get('/', getAllTeams);
router.get('/:id', getTeam);
router.post('/', createTeam);
router.put('/:id', updateTeam);
router.delete('/:id', deleteTeam);
router.post('/:id/assign', assignEmployeeToTeam);
router.post('/:id/remove', removeEmployeeFromTeam);

module.exports = router;