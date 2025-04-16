import React, { useState, useEffect } from 'react';

const SERVER_URL = 'https://recipe-grab-bag-server.onrender.com';

export default function App() {
  const [input, setInput] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [triedRecipes, setTriedRecipes] = useState([]);
  const [viewTried, setViewTried] = useState(false);

  const fetchRecipes = async () => {
    const res = await fetch(`${SERVER_URL}/recipes`);
    const data = await res.json();
    setRecipes(data.recipes || []);
    setTriedRecipes(data.triedRecipes || []);
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const addRecipe = async () => {
    if (input.trim()) {
      await fetch(`${SERVER_URL}/recipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: input.trim() })
      });
      setInput('');
      fetchRecipes();
    }
  };

  const pickRandomRecipe = async () => {
    if (!recipes.length) return;
    const idx = Math.floor(Math.random() * recipes.length);
    const selected = recipes[idx];

    await fetch(`${SERVER_URL}/try`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: selected })
    });

    window.open(selected, '_blank');
    fetchRecipes();
  };

  const updateTried = async (index, key, value) => {
    await fetch(`${SERVER_URL}/tried/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ index, key, value })
    });
    const updated = [...triedRecipes];
    updated[index][key] = value;
    setTriedRecipes(updated);
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Recipe Grab Bag</h1>
      {!viewTried ? (
        <div>
          <input
            type="text"
            className="border p-2 rounded w-full mb-2"
            placeholder="Paste recipe link here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
            onClick={addRecipe}
          >
            Save Recipe
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={pickRandomRecipe}
          >
            Pick a Random Recipe
          </button>
          <p className="mt-4">Saved Recipes: {recipes.length}</p>
          <button className="mt-2 underline text-sm" onClick={() => setViewTried(true)}>
            View Tried Recipes
          </button>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-2">Tried Recipes</h2>
          {triedRecipes.length === 0 && <p>No recipes tried yet.</p>}
          {triedRecipes.map((item, idx) => (
            <div key={idx} className="mb-4 border-b pb-2">
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                {item.url}
              </a>
              <textarea
                className="block border p-1 w-full mt-2"
                placeholder="Notes..."
                value={item.notes}
                onChange={(e) => updateTried(idx, 'notes', e.target.value)}
              />
              <input
                type="number"
                min="0"
                max="5"
                className="border mt-2 p-1 w-20"
                value={item.rating}
                onChange={(e) => updateTried(idx, 'rating', parseInt(e.target.value) || 0)}
              />
            </div>
          ))}
          <button className="mt-4 underline text-sm" onClick={() => setViewTried(false)}>
            Back to Grab Bag
          </button>
        </div>
      )}
    </div>
  );
}
