import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Form, InputGroup, Alert, Spinner } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';

const API_BASE = import.meta?.env?.VITE_API_URL || 'http://localhost:5000';

export default function SignIn1() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!email || !password) {
      setErr('Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`https://crunchy-cookies-server.onrender.com/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // harmless; keeps future flexibility
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || 'Login failed');
      }

      // Save to localStorage with key 'admin'
      // Expected shape from your backend: { success, message, token, data: user }
      localStorage.setItem('admin', JSON.stringify({
        token: data?.token || '',
        user: data?.data || null
      }));

      // (Optional) set default auth header for future fetch/axios if you use axios.
      // axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

      navigate('/'); // change to '/dashboard' if needed
    } catch (e) {
      setErr(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{ background: '#111', minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <div className="text-center" style={{ backgroundColor: "#222 !important", minWidth: '600px', maxWidth: 640 }}>
        <Card className="borderless">
          <Row className="align-items-center text-center">
            <Col>
              <Card.Body className="card-body">
                <h1 className="mb-4" style={{ fontSize: '32px', color: '#0FB4BB' }}>CRUNCHY COOKIES</h1>
                <h4 className="mb-3 f-w-400">Signin</h4>

                {err ? <Alert variant="danger" className="text-start">{err}</Alert> : null}

                <Form onSubmit={handleSubmit}>
                  <InputGroup className="mb-3">
                    <InputGroup.Text>
                      <FeatherIcon icon="mail" />
                    </InputGroup.Text>
                    <Form.Control
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </InputGroup>

                  <InputGroup className="mb-3">
                    <InputGroup.Text>
                      <FeatherIcon icon="lock" />
                    </InputGroup.Text>
                    <Form.Control
                      type={showPwd ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                    <Button
                      variant="outline-secondary"
                      type="button"
                      onClick={() => setShowPwd((s) => !s)}
                    >
                      <FeatherIcon icon={showPwd ? 'eye-off' : 'eye'} />
                    </Button>
                  </InputGroup>

                  <Button
                    type="submit"
                    className="w-100 btn btn-block btn-primary mb-3"
                    disabled={loading}
                  >
                    {loading ? <Spinner size="sm" animation="border" /> : 'Signin'}
                  </Button>
                </Form>
              </Card.Body>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
}
