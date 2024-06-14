module.exports.generateQuery = (query, filterColumn = "") => {
  let { page, limit, filters, globalFilter, sorting, ...restQuery } = query;
  const pageNum = page ? parseInt(page, 10) : 1;
  const Limit = limit ? parseInt(limit, 10) : 10;
  const skip = Limit * (pageNum - 1);

  let sortQuery = { created_at: "desc" };
  sorting = sorting ? JSON.parse(sorting) : [];
  if (sorting.length > 0) {
    sortQuery = {};
    sorting.map((item) => {
      sortQuery[item.id] = item.desc === false ? "asc" : "desc";
    });
  }

  filters = filters ? JSON.parse(filters) : [];
  if (filters.length > 0) {
    filters.map((item) => {
      restQuery[item.id] = item.value;
    });
  }

  if (globalFilter && filterColumn !== "") {
    restQuery["$or"] = [];
    filterColumn.split(",").map((item) => {
      restQuery["$or"].push({
        [item]: { $regex: globalFilter, $options: "i" },
      });
    });
  }

  return { skip, Limit, query: restQuery, sortQuery };
};
