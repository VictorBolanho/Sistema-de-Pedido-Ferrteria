const accessRequestsService = require("./access-requests.service");

async function submitRequest(req, res, next) {
  try {
    // Mock file URLs - in production, you would upload to cloud storage (S3, Azure Blob, etc.)
    const mockFileUrl = (filename) => {
      return filename ? `/uploads/documents/${Date.now()}-${filename}` : null;
    };

    const payload = {
      company_name: req.body.company_name,
      tax_id: req.body.tax_id,
      contact_name: req.body.contact_name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      rut_file_url: mockFileUrl(req.files?.rut_file?.[0]?.filename),
      chamber_file_url: mockFileUrl(req.files?.chamber_file?.[0]?.filename),
      id_file_url: mockFileUrl(req.files?.id_file?.[0]?.filename),
    };

    const result = await accessRequestsService.submitAccessRequest(payload);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function getRequests(req, res, next) {
  try {
    const status = req.query.status;
    const filters = status ? { status } : {};

    const requests = await accessRequestsService.getRequests(filters);
    res.json(requests);
  } catch (error) {
    next(error);
  }
}

async function approveRequest(req, res, next) {
  try {
    const { id } = req.params;
    const result = await accessRequestsService.approveAccessRequest(
      id,
      req.user,
      {
        advisorId: req.body?.advisorId || req.body?.advisor_id || null,
        adminNotes: req.body?.adminNotes || req.body?.admin_notes || null,
      }
    );

    res.json({
      message: "Access request approved",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function rejectRequest(req, res, next) {
  try {
    const { id } = req.params;
    const adminNotes = req.body.admin_notes || req.body.adminNotes || "";

    const result = await accessRequestsService.rejectAccessRequest(
      id,
      adminNotes,
      req.user
    );

    res.json({
      message: "Access request rejected",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  submitRequest,
  getRequests,
  approveRequest,
  rejectRequest,
};
