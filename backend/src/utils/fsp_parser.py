from flask import request
from bson.objectid import ObjectId


def parse_task_fsp_params(default_limit=10):
    """
    Parses Flask request arguments for Filtering, Sorting, and Pagination (FSP)
    parameters specific to tasks.

    Returns:
        tuple: (query_filter, query_sort, skip, limit)
    """
    args = request.args

   
    try:
        page = int(args.get("page", 1))
        limit = int(args.get("limit", default_limit))
    except ValueError:
        page = 1
        limit = default_limit

    skip = (page - 1) * limit if page > 0 else 0
    limit = max(1, limit)  

 
    query_filter = {}

    
    status = args.get("status")
    if status:
        query_filter["status"] = status

    
    priority = args.get("priority")
    if priority:
        query_filter["priority"] = priority

 
    due_date_max = args.get("due_date_max")
    if due_date_max:

        query_filter["due_date"] = {"$lte": due_date_max}

    assigned_to = args.get("assigned_to")
    if assigned_to:
        try:
            query_filter["assigned_to"] = ObjectId(assigned_to)
        except:
      
            pass

    
    sort_param = args.get("sort", "-due_date")  # Default sort by descending due date
    query_sort = []

    sort_fields = sort_param.split(",")
    for field in sort_fields:
        field = field.strip()
        if field.startswith("-"):
            
            query_sort.append((field[1:], -1))
        elif field:
            
            query_sort.append((field, 1))

    return query_filter, query_sort, skip, limit
