
import express from 'express';
import * as taskHandler from '../handlers/task-handler';
import { authorizer } from '../middlerwares/auth-middleware';

const router = express.Router();

router.post('/', authorizer, taskHandler.create);
router.get('/', authorizer, taskHandler.get);
router.get('/stats', authorizer, taskHandler.stats);
router.get('/:id', authorizer, taskHandler.getById);
router.put("/:id", authorizer, taskHandler.update)

export default router;