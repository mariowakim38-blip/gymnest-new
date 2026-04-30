import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      });
    }

    const {
      email,
      password,
      name,
      username,
      phoneNumber,
      childName,
      childAge,
    } = await req.json();

    if (!email || !password || !name || !username || !phoneNumber || !childName || !childAge) {
      return Response.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const cleanPhone = phoneNumber.startsWith('+961')
      ? phoneNumber
      : `+961${phoneNumber}`;

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: email.trim(),
        password,
        email_confirm: true,
      });

    if (authError || !authData.user) {
      return Response.json(
        { success: false, error: authError?.message || 'Failed to create auth user' },
        { status: 400 }
      );
    }

    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        name: name.trim(),
        username: username.trim(),
        phone_number: cleanPhone,
        role: 'parent',
      })
      .select()
      .single();

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);

      return Response.json(
        { success: false, error: profileError.message },
        { status: 400 }
      );
    }

    const { error: childError } = await supabaseAdmin
      .from('children')
      .insert({
        profile_id: profileData.id,
        name: childName.trim(),
        age: Number(childAge),
      });

    if (childError) {
      return Response.json(
        { success: false, error: childError.message },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      userId: authData.user.id,
      profileId: profileData.id,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unexpected error',
      },
      { status: 500 }
    );
  }
