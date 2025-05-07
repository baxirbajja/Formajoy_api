const express = require('express');
const { getOrganizations, getOrganization, createOrganization, updateOrganization, deleteOrganization } = require('../controllers/organizationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protection de toutes les routes
router.use(protect);

// Routes pour les organisations
router.route('/')
  .get(authorize('admin'), getOrganizations)
  .post(authorize('admin'), createOrganization);

router.route('/:id')
  .get(authorize('admin', 'organisation'), getOrganization)
  .put(authorize('admin', 'organisation'), updateOrganization)
  .delete(authorize('admin'), deleteOrganization);

module.exports = router;