import { Router } from 'express';
import { isValidObjectId, type Model, type UpdateQuery } from 'mongoose';

export function createCrudRouter<T>(model: Model<T>, sort: Record<string, 1 | -1> = { _id: 1 }): Router {
  const router = Router();

  router.get('/', async (_request, response) => {
    response.json(await model.find().sort(sort).lean());
  });

  router.get('/:id', async (request, response) => {
    if (!isValidObjectId(request.params.id)) {
      response.status(400).json({ error: 'Invalid resource identifier' });
      return;
    }

    const resource = await model.findById(request.params.id).lean();
    if (!resource) {
      response.status(404).json({ error: 'Resource not found' });
      return;
    }
    response.json(resource);
  });

  router.post('/', async (request, response) => {
    if (!isObjectBody<T>(request.body)) {
      response.status(400).json({ error: 'Request body must be a JSON object' });
      return;
    }

    response.status(201).json(await model.create(request.body));
  });

  router.patch('/:id', async (request, response) => {
    if (!isValidObjectId(request.params.id)) {
      response.status(400).json({ error: 'Invalid resource identifier' });
      return;
    }
    if (!isObjectBody<UpdateQuery<T>>(request.body)) {
      response.status(400).json({ error: 'Request body must be a JSON object' });
      return;
    }

    const resource = await model
      .findByIdAndUpdate(request.params.id, request.body, { new: true, runValidators: true })
      .lean();
    if (!resource) {
      response.status(404).json({ error: 'Resource not found' });
      return;
    }
    response.json(resource);
  });

  router.delete('/:id', async (request, response) => {
    if (!isValidObjectId(request.params.id)) {
      response.status(400).json({ error: 'Invalid resource identifier' });
      return;
    }

    const resource = await model.findByIdAndDelete(request.params.id).lean();
    if (!resource) {
      response.status(404).json({ error: 'Resource not found' });
      return;
    }
    response.status(204).end();
  });

  return router;
}

function isObjectBody<T>(body: unknown): body is T {
  return typeof body === 'object' && body !== null && !Array.isArray(body);
}
