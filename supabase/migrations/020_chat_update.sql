-- Migration for allowing users to update their own public messages

CREATE POLICY "Users can update their own messages" 
ON public_messages FOR UPDATE 
USING (auth.role() = 'authenticated' AND user_id = auth.uid());
