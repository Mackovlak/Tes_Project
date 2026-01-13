import { headers } from "next/headers";
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || ''

export function getTokenUserId(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    return console.log("TOKEN AUTH : ", authHeader, token)
    //WAIT, THIS IS NOT USED????
    //AND IT STILL WORK?
    //THEN THIS FUNCTION IS NOT USE?
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.id || null;
  } catch (err) {
    console.error("Error fetching token : ",err);
    return null;
  }
}
