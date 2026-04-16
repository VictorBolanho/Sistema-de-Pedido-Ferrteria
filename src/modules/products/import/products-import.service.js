const HttpError = require("../../../utils/http-error");

class ProductsImportService {
  // Placeholder for future Excel import pipeline.
  async importFromExcel(_fileBuffer, _requester) {
    throw new HttpError(501, "Excel import is not implemented yet");
  }

  // Placeholder for future XML import pipeline.
  async importFromXml(_xmlContent, _requester) {
    throw new HttpError(501, "XML import is not implemented yet");
  }

  // Shared row normalization hook for future import sources.
  normalizeImportRow(row) {
    return {
      name: row.name,
      sku: row.sku,
      price: row.price,
      stock: row.stock,
      category: row.category,
      active: row.active,
    };
  }
}

module.exports = new ProductsImportService();

