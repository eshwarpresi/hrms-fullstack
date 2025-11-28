const { Team, Employee, Log } = require('../models');

exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.findAll({
      where: { organisation_id: req.organisation.id },
      include: [{
        model: Employee,
        as: 'employees',
        through: { attributes: [] },
        attributes: ['id', 'first_name', 'last_name', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: teams
    });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching teams'
    });
  }
};

exports.getTeam = async (req, res) => {
  try {
    const team = await Team.findOne({
      where: { 
        id: req.params.id, 
        organisation_id: req.organisation.id 
      },
      include: [{
        model: Employee,
        as: 'employees',
        through: { attributes: [] },
        attributes: ['id', 'first_name', 'last_name', 'email', 'position']
      }]
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    res.json({
      success: true,
      data: team
    });
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching team'
    });
  }
};

exports.createTeam = async (req, res) => {
  try {
    const { name, description, employee_ids } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Team name is required'
      });
    }

    const team = await Team.create({
      name,
      description,
      organisation_id: req.organisation.id
    });

    // Add employees if specified
    if (employee_ids && employee_ids.length > 0) {
      const employees = await Employee.findAll({
        where: { 
          id: employee_ids, 
          organisation_id: req.organisation.id 
        }
      });
      await team.addEmployees(employees);
    }

    // Log the action
    await Log.create({
      action: 'team_created',
      details: JSON.stringify({ 
        teamId: team.id, 
        teamName: name 
      }),
      organisation_id: req.organisation.id,
      user_id: req.user.id
    });

    const createdTeam = await Team.findByPk(team.id, {
      include: [{
        model: Employee,
        as: 'employees',
        through: { attributes: [] },
        attributes: ['id', 'first_name', 'last_name', 'email']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: createdTeam
    });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating team'
    });
  }
};

exports.updateTeam = async (req, res) => {
  try {
    const { name, description, employee_ids } = req.body;
    const teamId = req.params.id;

    const team = await Team.findOne({
      where: { 
        id: teamId, 
        organisation_id: req.organisation.id 
      }
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    await team.update({
      name,
      description
    });

    // Update employee assignments
    if (employee_ids) {
      const employees = await Employee.findAll({
        where: { 
          id: employee_ids, 
          organisation_id: req.organisation.id 
        }
      });
      await team.setEmployees(employees);
    }

    // Log the action
    await Log.create({
      action: 'team_updated',
      details: JSON.stringify({ 
        teamId: team.id, 
        updates: { name, description } 
      }),
      organisation_id: req.organisation.id,
      user_id: req.user.id
    });

    const updatedTeam = await Team.findByPk(team.id, {
      include: [{
        model: Employee,
        as: 'employees',
        through: { attributes: [] },
        attributes: ['id', 'first_name', 'last_name', 'email']
      }]
    });

    res.json({
      success: true,
      message: 'Team updated successfully',
      data: updatedTeam
    });
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating team'
    });
  }
};

exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findOne({
      where: { 
        id: req.params.id, 
        organisation_id: req.organisation.id 
      }
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Log before deletion
    await Log.create({
      action: 'team_deleted',
      details: JSON.stringify({ 
        teamId: team.id, 
        teamName: team.name 
      }),
      organisation_id: req.organisation.id,
      user_id: req.user.id
    });

    await team.destroy();

    res.json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting team'
    });
  }
};

exports.assignEmployeeToTeam = async (req, res) => {
  try {
    const { employee_id } = req.body;
    const teamId = req.params.id;

    const team = await Team.findOne({
      where: { 
        id: teamId, 
        organisation_id: req.organisation.id 
      }
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    const employee = await Employee.findOne({
      where: { 
        id: employee_id, 
        organisation_id: req.organisation.id 
      }
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    await team.addEmployee(employee);

    // Log the action
    await Log.create({
      action: 'employee_assigned_to_team',
      details: JSON.stringify({ 
        employeeId: employee.id,
        employeeName: `${employee.first_name} ${employee.last_name}`,
        teamId: team.id,
        teamName: team.name
      }),
      organisation_id: req.organisation.id,
      user_id: req.user.id
    });

    res.json({
      success: true,
      message: 'Employee assigned to team successfully'
    });
  } catch (error) {
    console.error('Assign employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while assigning employee to team'
    });
  }
};

exports.removeEmployeeFromTeam = async (req, res) => {
  try {
    const { employee_id } = req.body;
    const teamId = req.params.id;

    const team = await Team.findOne({
      where: { 
        id: teamId, 
        organisation_id: req.organisation.id 
      }
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    const employee = await Employee.findOne({
      where: { 
        id: employee_id, 
        organisation_id: req.organisation.id 
      }
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    await team.removeEmployee(employee);

    // Log the action
    await Log.create({
      action: 'employee_removed_from_team',
      details: JSON.stringify({ 
        employeeId: employee.id,
        employeeName: `${employee.first_name} ${employee.last_name}`,
        teamId: team.id,
        teamName: team.name
      }),
      organisation_id: req.organisation.id,
      user_id: req.user.id
    });

    res.json({
      success: true,
      message: 'Employee removed from team successfully'
    });
  } catch (error) {
    console.error('Remove employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing employee from team'
    });
  }
};