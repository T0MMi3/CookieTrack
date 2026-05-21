const cookieService = require('../services/cookieService');

const createCookie = async (req, res) => {
  try {
    const CookieId = await cookieService.createCookie(req.body);
    console.log('Cookie created successfully:', { id: CookieId });
    res.status(201).json({ message: "Cookie created successfully",id: CookieId });
  } catch (error) {
    console.error('Failed to create cookie:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const getAllCookie = async (req, res) => {
  try {
    const Cookies = await cookieService.getAllCookies();
    console.log('All Cookies in DB:', Cookies );
    res.status(200).json(Cookies);
  } catch (error) {
    console.error('Failed to fetch cookie:', error.message);
    res.status(500).json({ message: error.message });
  }
};


const updateCookie = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await cookieService.updateCookie(id, req.body);
    console.log('Updated Cookie:', result );
    res.status(200).json(result);
  } catch (error) {
    console.error('Failed to update cookie:', error.message);
    res.status(500).json({ message: error.message });
    
  }
};

const deleteCookie = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await cookieService.deleteCookie(id);
    console.log('Cookie deleted successfully:', result);
    res.status(200).json(result);
  } catch (error) {
    console.error('Failed to delete cookie:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const getMonthlyCookies = async (req, res) => {
  try {
    const Cookies = await cookieService.getMonthlyCookies();
    console.log('Monthly Cookies:', Cookies );
    res.status(200).json(Cookies);
  } catch (error) {
    console.log('Failed to fetch Monthly Cookies:', error.message );
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCookie,
  getAllCookie,
  updateCookie,
  deleteCookie,
  getMonthlyCookies
};
