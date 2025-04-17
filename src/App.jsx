import React, { useState, useEffect } from 'react';

const SERVER_URL = 'https://recipe-grab-bag-server.onrender.com';

export default function App() {
  const [input, setInput] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [triedRecipes, setTriedRecipes] = useState([]);
  const [view, setView] = useState('main'); // 'main', 'tried', 'saved'

  const fetchRecipes = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/recipes`);
      const data = await res.json();
      setRecipes(data.recipes || []);
      setTriedRecipes(data.triedRecipes || []);
    } catch (err) {
      console.error('Failed to fetch recipes:', err);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const addRecipe = async () => {
    if (input.trim()) {
      try {
        await fetch(`${SERVER_URL}/recipes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: input.trim() })
        });
        setInput('');
        fetchRecipes();
      } catch (err) {
        console.error('Failed to add recipe:', err);
      }
    }
  };

  const pickRandomRecipe = async () => {
    if (!recipes.length) return;
    const idx = Math.floor(Math.random() * recipes.length);
    const selected = recipes[idx];

    await fetch(`${SERVER_URL}/try`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: selected.url })
    });

    window.open(selected.url, '_blank');
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
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-pink-100 text-gray-800">
      <div className="sticky top-0 bg-white shadow-md z-10 px-6 py-4 flex justify-between items-center border-b border-gray-200">
        <h1 className="text-3xl font-extrabold text-pink-600">🍳 My Recipe Grab Bag</h1>
        <div className="flex gap-4 text-sm">
          <button
            onClick={() => setView('main')}
            className={`underline ${view === 'main' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            ➕ Add & Pick
          </button>
          <button
            onClick={() => setView('saved')}
            className={`underline ${view === 'saved' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            📄 Saved
          </button>
          <button
            onClick={() => setView('tried')}
            className={`underline ${view === 'tried' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            ✅ Tried
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {view === 'main' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-4">
              <input
                type="text"
                className="col-span-3 border border-gray-300 p-3 rounded shadow-sm w-full"
                placeholder="Paste recipe link here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                onClick={addRecipe}
                className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded shadow w-full"
              >
                Save
              </button>
            </div>

            <button
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow w-full mb-4"
              onClick={pickRandomRecipe}
            >
              🎲 Pick a Random Recipe
            </button>
          </>
        )}

        {view === 'saved' && (
          <>
            <h2 className="text-2xl font-semibold mb-4 text-pink-700">Saved Recipes</h2>
            <p className="mb-4 text-sm text-gray-600">
              You have {recipes.length} saved recipe{recipes.length !== 1 ? 's' : ''}.
            </p>
            <div className="space-y-4">
              {recipes.map((item, idx) => (
                <div key={item._id || idx} className="bg-white p-4 rounded shadow-md border border-gray-200">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline break-all"
                  >
                    {item.url}
                  </a>
                </div>
              ))}
            </div>
          </>
        )}

        {view === 'tried' && (
          <>
            <h2 className="text-2xl font-semibold mb-4 text-pink-700">Tried Recipes</h2>
            {triedRecipes.length === 0 && <p className="text-gray-500">No recipes tried yet.</p>}
            <div className="space-y-6">
              {triedRecipes.map((item, idx) => (
                <div key={item._id || idx} className="bg-white p-4 rounded shadow-md border border-gray-200">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline break-all"
                  >
                    {item.url}
                  </a>
                  <textarea
                    className="block border border-gray-300 rounded w-full mt-3 p-2 text-sm"
                    placeholder="Notes..."
                    value={item.notes}
                    onChange={(e) => updateTried(idx, 'notes', e.target.value)}
                  />
                  <label className="block mt-3 text-sm font-medium">Rating (0–5):</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    className="border border-gray-300 rounded p-1 mt-1 w-24"
                    value={item.rating}
                    onChange={(e) => updateTried(idx, 'rating', parseInt(e.target.value) || 0)}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
