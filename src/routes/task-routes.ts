
import express from 'express';
import * as taskHandler from '../handlers/task-handler';
import { authorizer } from '../middlerwares/auth-middleware';

const router = express.Router();
router.get('/stats', authorizer, taskHandler.stats);
router.post('/', authorizer, taskHandler.create);
router.get('/', authorizer, taskHandler.get);
router.put("/:id", authorizer, taskHandler.update)
router.delete("/:id", authorizer, taskHandler.deleteTask)

export default router;