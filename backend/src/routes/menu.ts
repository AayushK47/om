import { Router } from 'express';
import { Menu } from '../models';

const router = Router();

// GET /api/menu - Get all menu items
router.get('/', async (req, res) => {
  try {
    const menuItems = await Menu.findAll({
      order: [['name', 'ASC']],
    });
    
    res.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// POST /api/menu - Create a new menu item
router.post('/', async (req, res) => {
  try {
    const { name, price } = req.body;
    
    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }
    
    const menuItem = await Menu.create({ name, price });
    res.status(201).json(menuItem);
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

export default router;
