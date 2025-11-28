const { Employee, Team, Log } = require('../models');

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      where: { organisation_id: req.organisation.id },
      include: [{
        model: Team,
        as: 'teams',
        through: { attributes: [] },
        attributes: ['id', 'name']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: employees
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching employees'
    });
  }
};

exports.getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      where: { 
        id: req.params.id, 
        organisation_id: req.organisation.id 
      },
      include: [{
        model: Team,
        as: 'teams',
        through: { attributes: [] },
        attributes: ['id', 'name']
      }]
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching employee'
    });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, position, team_ids } = req.body;

    if (!first_name || !last_name || !email) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, and email are required'
      });
    }

    const employee = await Employee.create({
      first_name,
      last_name,
      email,
      phone,
      position,
      organisation_id: req.organisation.id
    });

    // Add to teams if specified
    if (team_ids && team_ids.length > 0) {
      const teams = await Team.findAll({
        where: { 
          id: team_ids, 
          organisation_id: req.organisation.id 
        }
      });
      await employee.addTeams(teams);
    }

    // Log the action
    await Log.create({
      action: 'employee_created',
      details: JSON.stringify({ 
        employeeId: employee.id, 
        employeeName: `${first_name} ${last_name}`,
        email 
      }),
      organisation_id: req.organisation.id,
      user_id: req.user.id
    });

    const createdEmployee = await Employee.findByPk(employee.id, {
      include: [{
        model: Team,
        as: 'teams',
        through: { attributes: [] },
        attributes: ['id', 'name']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: createdEmployee
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating employee'
    });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, position, team_ids } = req.body;
    const employeeId = req.params.id;

    const employee = await Employee.findOne({
      where: { 
        id: employeeId, 
        organisation_id: req.organisation.id 
      }
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    await employee.update({
      first_name,
      last_name,
      email,
      phone,
      position
    });

    // Update team assignments
    if (team_ids) {
      const teams = await Team.findAll({
        where: { 
          id: team_ids, 
          organisation_id: req.organisation.id 
        }
      });
      await employee.setTeams(teams);
    }

    // Log the action
    await Log.create({
      action: 'employee_updated',
      details: JSON.stringify({ 
        employeeId: employee.id, 
        updates: { first_name, last_name, email, phone, position } 
      }),
      organisation_id: req.organisation.id,
      user_id: req.user.id
    });

    const updatedEmployee = await Employee.findByPk(employee.id, {
      include: [{
        model: Team,
        as: 'teams',
        through: { attributes: [] },
        attributes: ['id', 'name']
      }]
    });

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: updatedEmployee
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating employee'
    });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      where: { 
        id: req.params.id, 
        organisation_id: req.organisation.id 
      }
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Log before deletion
    await Log.create({
      action: 'employee_deleted',
      details: JSON.stringify({ 
        employeeId: employee.id, 
        employeeName: `${employee.first_name} ${employee.last_name}` 
      }),
      organisation_id: req.organisation.id,
      user_id: req.user.id
    });

    await employee.destroy();

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting employee'
    });
  }
};