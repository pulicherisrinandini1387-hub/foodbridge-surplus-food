import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Utensils, MapPin, Clock, Phone, User, Package, ShieldCheck,
  Check, ArrowRight, ArrowLeft, PartyPopper, Leaf,
} from 'lucide-react';
import { DashboardLayout, PageHeader } from '@/components/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useApp } from '@/store/AppContext';
import { useToast } from '@/components/ui/Toast';
import { Confetti } from '@/components/ui/Confetti';
import type { FoodCategory, FoodType, DeliveryOption } from '@/types';

const categories: FoodCategory[] = ['Cooked Meals', 'Raw Produce', 'Bakery', 'Dairy', 'Grains & Staples', 'Beverages', 'Snacks & Packaged'];
const foodTypes: FoodType[] = ['Vegetarian', 'Non-Vegetarian', 'Vegan'];
const deliveryOptions: { value: DeliveryOption; label: string; desc: string }[] = [
  { value: 'NGO_PICKUP', label: 'NGO Pickup', desc: 'The NGO will pick up the food from your location' },
  { value: 'VOLUNTEER_REQUIRED', label: 'Volunteer Pickup Required', desc: 'A volunteer will pick up and deliver to the NGO' },
  { value: 'DONOR_DELIVERS', label: 'I Will Deliver', desc: 'You will deliver the food to the NGO yourself' },
];
const allergenOptions = ['Dairy', 'Gluten', 'Nuts', 'Eggs', 'Seafood', 'Soy', 'Sesame'];

export function PostDonation() {
  const { postDonation, currentUserId, users } = useApp();
  const { show } = useToast();
  const navigate = useNavigate();
  const user = users.find((u) => u.id === currentUserId);

  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [postedMeals, setPostedMeals] = useState(0);

  const [form, setForm] = useState({
    foodName: '',
    category: 'Cooked Meals' as FoodCategory,
    foodType: 'Vegetarian' as FoodType,
    quantity: '',
    meals: '',
    preparationTime: '',
    bestBefore: '',
    condition: '',
    allergens: [] as string[],
    packaging: '',
    pickupAddress: user?.location || '',
    pickupFrom: '',
    pickupDeadline: '',
    contactPerson: user?.name || '',
    contactPhone: user?.phone || '',
    deliveryOption: 'VOLUNTEER_REQUIRED' as DeliveryOption,
    safetyDeclared: false,
    expiryHours: '2',
  });

  const update = (key: string, value: unknown) => setForm({ ...form, [key]: value });

  const toggleAllergen = (a: string) => {
    update('allergens', form.allergens.includes(a) ? form.allergens.filter((x) => x !== a) : [...form.allergens, a]);
  };

  const canProceed = () => {
    if (step === 1) return form.foodName && form.quantity && form.meals && form.condition;
    if (step === 2) return form.pickupAddress && form.pickupFrom && form.pickupDeadline && form.contactPerson && form.contactPhone;
    if (step === 3) return form.deliveryOption;
    if (step === 4) return form.safetyDeclared;
    return false;
  };

  const handleSubmit = () => {
    const expiryDate = new Date(Date.now() + (parseInt(form.expiryHours) || 2) * 60 * 60 * 1000).toISOString();
    const donation = postDonation({
      foodName: form.foodName,
      category: form.category,
      foodType: form.foodType,
      quantity: form.quantity,
      meals: parseInt(form.meals) || 0,
      preparationTime: form.preparationTime,
      bestBefore: form.bestBefore,
      condition: form.condition,
      allergens: form.allergens,
      packaging: form.packaging,
      pickupAddress: form.pickupAddress,
      pickupFrom: form.pickupFrom,
      pickupDeadline: form.pickupDeadline,
      contactPerson: form.contactPerson,
      contactPhone: form.contactPhone,
      deliveryOption: form.deliveryOption,
      safetyDeclared: form.safetyDeclared,
      expiresAt: expiryDate,
      imageColor: user?.avatarColor || '#16a34a',
    });
    setPostedMeals(donation.meals);
    setConfettiTrigger((t) => t + 1);
    setSuccess(true);
    show('Donation posted successfully!', 'success');
  };

  if (success) {
    return (
      <DashboardLayout>
        <Confetti trigger={confettiTrigger} />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 12 }}
            className="w-24 h-24 rounded-3xl bg-brand-100 flex items-center justify-center text-brand-600 mb-6"
          >
            <PartyPopper className="w-12 h-12" />
          </motion.div>
          <h1 className="text-3xl font-bold text-ink-900">Donation Posted!</h1>
          <p className="text-lg text-ink-500 mt-3 max-w-md">
            Your {postedMeals} meals are now visible to verified receivers nearby.
          </p>
          <div className="flex gap-3 mt-8">
            <Button variant="outline" onClick={() => { setSuccess(false); setStep(1); setForm({ ...form, foodName: '', quantity: '', meals: '', condition: '' }); }}>
              Post Another
            </Button>
            <Button onClick={() => navigate('/donor/my-donations')}>
              View My Donations <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader title="Post Surplus Food" subtitle="Complete this form in under 60 seconds" />

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8 max-w-2xl">
        {[
          { n: 1, label: 'Food Info' },
          { n: 2, label: 'Pickup' },
          { n: 3, label: 'Delivery' },
          { n: 4, label: 'Confirm' },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step >= s.n ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-400'
              }`}>
                {step > s.n ? <Check className="w-4 h-4" /> : s.n}
              </div>
              <span className={`text-sm font-medium hidden sm:inline ${step >= s.n ? 'text-ink-900' : 'text-ink-400'}`}>{s.label}</span>
            </div>
            {i < 3 && <div className={`flex-1 h-0.5 mx-2 rounded-full ${step > s.n ? 'bg-brand-500' : 'bg-ink-100'}`} />}
          </div>
        ))}
      </div>

      <div className="max-w-2xl">
        <Card className="p-6 lg:p-8">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h3 className="font-bold text-ink-900 text-lg">Food Information</h3>
              <Input label="Food Name" placeholder="e.g. Vegetarian Thali Meals" value={form.foodName} onChange={(e) => update('foodName', e.target.value)} />
              <div className="grid sm:grid-cols-2 gap-4">
                <Select label="Category" value={form.category} onChange={(e) => update('category', e.target.value)} options={categories.map((c) => ({ value: c, label: c }))} />
                <Select label="Food Type" value={form.foodType} onChange={(e) => update('foodType', e.target.value)} options={foodTypes.map((f) => ({ value: f, label: f }))} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Quantity" placeholder="e.g. 45 boxes" value={form.quantity} onChange={(e) => update('quantity', e.target.value)} />
                <Input label="Number of Meals" type="number" placeholder="e.g. 45" value={form.meals} onChange={(e) => update('meals', e.target.value)} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Preparation Time" placeholder="e.g. 12:30 PM" value={form.preparationTime} onChange={(e) => update('preparationTime', e.target.value)} />
                <Input label="Best Before" placeholder="e.g. 4:30 PM" value={form.bestBefore} onChange={(e) => update('bestBefore', e.target.value)} />
              </div>
              <Input label="Food Condition" placeholder="e.g. Freshly cooked, warm" value={form.condition} onChange={(e) => update('condition', e.target.value)} />
              <Input label="Packaging Type" placeholder="e.g. Sealed food-grade boxes" value={form.packaging} onChange={(e) => update('packaging', e.target.value)} />
              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-2">Allergens</label>
                <div className="flex flex-wrap gap-2">
                  {allergenOptions.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAllergen(a)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                        form.allergens.includes(a) ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-ink-600 border-ink-200 hover:border-ink-300'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={() => setStep(2)} disabled={!canProceed()}>Continue <ArrowRight className="w-4 h-4" /></Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h3 className="font-bold text-ink-900 text-lg">Pickup Information</h3>
              <Textarea label="Pickup Address" placeholder="Full address with landmark" value={form.pickupAddress} onChange={(e) => update('pickupAddress', e.target.value)} />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Pickup Available From" placeholder="e.g. 1:00 PM" value={form.pickupFrom} onChange={(e) => update('pickupFrom', e.target.value)} />
                <Input label="Pickup Deadline" placeholder="e.g. 3:30 PM" value={form.pickupDeadline} onChange={(e) => update('pickupDeadline', e.target.value)} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Contact Person" placeholder="Name" icon={<User className="w-4 h-4" />} value={form.contactPerson} onChange={(e) => update('contactPerson', e.target.value)} />
                <Input label="Contact Number" placeholder="+91 98450 12345" icon={<Phone className="w-4 h-4" />} value={form.contactPhone} onChange={(e) => update('contactPhone', e.target.value)} />
              </div>
              <Input label="Expiry (hours from now)" type="number" placeholder="2" value={form.expiryHours} onChange={(e) => update('expiryHours', e.target.value)} hint="How long until this food is no longer safe to consume" />
              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4" /> Back</Button>
                <Button onClick={() => setStep(3)} disabled={!canProceed()}>Continue <ArrowRight className="w-4 h-4" /></Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h3 className="font-bold text-ink-900 text-lg">Delivery Requirement</h3>
              <div className="space-y-2.5">
                {deliveryOptions.map((opt) => {
                  const selected = form.deliveryOption === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => update('deliveryOption', opt.value)}
                      className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                        selected ? 'border-brand-500 bg-brand-50' : 'border-ink-200 hover:border-ink-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${selected ? 'border-brand-600 bg-brand-600' : 'border-ink-300'}`}>
                        {selected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <p className="font-semibold text-ink-900">{opt.label}</p>
                        <p className="text-sm text-ink-400">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="w-4 h-4" /> Back</Button>
                <Button onClick={() => setStep(4)} disabled={!canProceed()}>Continue <ArrowRight className="w-4 h-4" /></Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h3 className="font-bold text-ink-900 text-lg">Review & Confirm</h3>

              {/* Summary */}
              <div className="rounded-xl border border-ink-100 divide-y divide-ink-100">
                <div className="p-4">
                  <p className="text-xs text-ink-400 font-semibold uppercase mb-2">Food</p>
                  <div className="space-y-1.5 text-sm">
                    <Row label="Name" value={form.foodName} />
                    <Row label="Category" value={form.category} />
                    <Row label="Type" value={form.foodType} />
                    <Row label="Quantity" value={form.quantity} />
                    <Row label="Meals" value={form.meals} />
                    <Row label="Condition" value={form.condition} />
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-ink-400 font-semibold uppercase mb-2">Pickup</p>
                  <div className="space-y-1.5 text-sm">
                    <Row label="Address" value={form.pickupAddress} />
                    <Row label="From" value={form.pickupFrom} />
                    <Row label="Deadline" value={form.pickupDeadline} />
                    <Row label="Contact" value={`${form.contactPerson} (${form.contactPhone})`} />
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-ink-400 font-semibold uppercase mb-2">Delivery</p>
                  <Row label="Option" value={deliveryOptions.find((o) => o.value === form.deliveryOption)?.label || ''} />
                  <Row label="Expires in" value={`${form.expiryHours} hours`} />
                </div>
              </div>

              {/* Safety declaration */}
              <label className="flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all" style={{ borderColor: form.safetyDeclared ? '#16a34a' : '#e2e8f0', background: form.safetyDeclared ? '#f0fdf4' : 'white' }}>
                <input type="checkbox" checked={form.safetyDeclared} onChange={(e) => update('safetyDeclared', e.target.checked)} className="mt-1 w-5 h-5 rounded accent-brand-600" />
                <div>
                  <p className="text-sm font-semibold text-ink-900">Food Safety Declaration</p>
                  <p className="text-sm text-ink-500 mt-1">"I confirm that this food is safe for human consumption and has been handled appropriately."</p>
                </div>
              </label>

              <div className="flex items-center gap-2 text-sm text-brand-600">
                <Leaf className="w-4 h-4" />
                <span>Posting this donation will save an estimated {(parseInt(form.meals || '0') * 0.5).toFixed(1)} kg of CO₂ emissions</span>
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setStep(3)}><ArrowLeft className="w-4 h-4" /> Back</Button>
                <Button onClick={handleSubmit} disabled={!canProceed()} size="lg">
                  Post Donation <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-ink-400">{label}</span>
      <span className="text-ink-800 font-medium text-right">{value}</span>
    </div>
  );
}
