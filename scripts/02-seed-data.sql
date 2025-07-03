-- Insert sample users
INSERT INTO users (email, full_name, role) VALUES
  ('admin@silentpartners.com', 'Admin User', 'admin'),
  ('contributor@silentpartners.com', 'Contributor User', 'contributor'),
  ('viewer@silentpartners.com', 'Viewer User', 'viewer')
ON CONFLICT (email) DO NOTHING;

-- Insert sample tools
INSERT INTO tools (name, url, category, description, use_cases, pricing_model, cost_per_month, status, created_by) VALUES
  (
    'ChatGPT',
    'https://chat.openai.com',
    'AI Writing',
    'Advanced AI language model for text generation, editing, and conversation.',
    'Content creation, code assistance, brainstorming, customer support',
    'freemium',
    20.00,
    'active',
    (SELECT id FROM users WHERE email = 'admin@silentpartners.com' LIMIT 1)
  ),
  (
    'GitHub Copilot',
    'https://github.com/features/copilot',
    'Development',
    'AI-powered code completion and generation tool integrated with IDEs.',
    'Code completion, function generation, debugging assistance',
    'paid',
    10.00,
    'active',
    (SELECT id FROM users WHERE email = 'contributor@silentpartners.com' LIMIT 1)
  ),
  (
    'Midjourney',
    'https://midjourney.com',
    'Design',
    'AI image generation tool for creating artwork and visual content.',
    'Marketing materials, concept art, social media graphics',
    'paid',
    30.00,
    'active',
    (SELECT id FROM users WHERE email = 'admin@silentpartners.com' LIMIT 1)
  ),
  (
    'Notion AI',
    'https://notion.so',
    'Productivity',
    'AI-powered writing assistant integrated into Notion workspace.',
    'Document writing, summarization, brainstorming, task management',
    'freemium',
    8.00,
    'active',
    (SELECT id FROM users WHERE email = 'contributor@silentpartners.com' LIMIT 1)
  ),
  (
    'Grammarly',
    'https://grammarly.com',
    'AI Writing',
    'AI-powered writing assistant for grammar, style, and tone improvement.',
    'Email writing, document editing, content review',
    'freemium',
    12.00,
    'active',
    (SELECT id FROM users WHERE email = 'admin@silentpartners.com' LIMIT 1)
  )
ON CONFLICT DO NOTHING;

-- Insert sample user ratings
INSERT INTO user_tools (user_id, tool_id, personal_notes, rating) VALUES
  (
    (SELECT id FROM users WHERE email = 'admin@silentpartners.com' LIMIT 1),
    (SELECT id FROM tools WHERE name = 'ChatGPT' LIMIT 1),
    'Essential for client communication and content drafting.',
    5
  ),
  (
    (SELECT id FROM users WHERE email = 'contributor@silentpartners.com' LIMIT 1),
    (SELECT id FROM tools WHERE name = 'GitHub Copilot' LIMIT 1),
    'Significantly speeds up development workflow.',
    4
  ),
  (
    (SELECT id FROM users WHERE email = 'admin@silentpartners.com' LIMIT 1),
    (SELECT id FROM tools WHERE name = 'Midjourney' LIMIT 1),
    'Great for initial concept development, but requires refinement.',
    4
  )
ON CONFLICT (user_id, tool_id) DO NOTHING;

-- Insert sample embed configuration
INSERT INTO embed_configurations (name, visible_columns, filters, sort_order, created_by) VALUES
  (
    'Public Tool Showcase',
    '["name", "url", "category", "description", "use_cases", "pricing_model"]',
    '{"status": "active"}',
    '{"field": "category", "direction": "asc"}',
    (SELECT id FROM users WHERE email = 'admin@silentpartners.com' LIMIT 1)
  )
ON CONFLICT DO NOTHING;
