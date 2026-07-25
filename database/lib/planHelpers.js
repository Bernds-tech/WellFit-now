const DEFAULT_PAGE_SIZE = 250;
const MAX_PAGE_SIZE = 400;

function normalizePageSize(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(parsed, MAX_PAGE_SIZE);
}

function hasOwnPath(value, dottedPath) {
  if (!value || typeof value !== "object") return false;
  const parts = String(dottedPath || "").split(".").filter(Boolean);
  let current = value;
  for (const part of parts) {
    if (!current || typeof current !== "object" || !Object.prototype.hasOwnProperty.call(current, part)) {
      return false;
    }
    current = current[part];
  }
  return true;
}

function valuesEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function mergeOperation(path, data, options = {}) {
  return {
    type: "merge",
    path,
    data,
    ensureCreatedAt: options.ensureCreatedAt === true,
    documentExists: options.documentExists === true,
    touchUpdatedAt: options.touchUpdatedAt !== false,
  };
}

function deleteFieldsOperation(path, fields, options = {}) {
  const normalizedFields = [...new Set((fields || []).map((field) => String(field || "").trim()).filter(Boolean))];
  return {
    type: "delete-fields",
    path,
    fields: normalizedFields,
    touchUpdatedAt: options.touchUpdatedAt !== false,
  };
}

function summarizePlan({ scannedDocuments = 0, operations = [], warnings = [] } = {}) {
  const byType = {};
  const byCollection = {};
  for (const operation of operations) {
    byType[operation.type] = Number(byType[operation.type] || 0) + 1;
    const [collectionName] = String(operation.path || "").split("/");
    byCollection[collectionName] = Number(byCollection[collectionName] || 0) + 1;
  }
  return {
    scannedDocuments: Number(scannedDocuments || 0),
    operationCount: operations.length,
    operationsByType: byType,
    operationsByCollection: byCollection,
    warningCount: warnings.length,
  };
}

module.exports = {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  normalizePageSize,
  hasOwnPath,
  valuesEqual,
  mergeOperation,
  deleteFieldsOperation,
  summarizePlan,
};
