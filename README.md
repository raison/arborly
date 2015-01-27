Arborly
=====================

This is a test app for the Namely team.

See it in action here! https://cryptic-plateau-3657.herokuapp.com/

Tree json can retrieved by a request to /api/tree/:startNode where :startNode is the person_id of the top of a subtree.
0 will retrieve the whole tree.
A sorted list of all the members of the tree or a subtree can be called at /api/list/:startNode/:sort, where :sort is either "name" or "jobtitle."

To add a new node to an existing node, the info should be posted to /api/add in the format {"name": "The Name", "jobtitle": "Job Title", "parent": 0}
To edit a node, post the info to /api/edit in the format {"name": "The New Name", "pk": 0} or {"jobtitle": "New Job Title", "pk": 0} where "pk" refers to the person's id.

