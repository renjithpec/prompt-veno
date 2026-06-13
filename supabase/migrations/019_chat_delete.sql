-- Migration for allowing users to delete their own public messages

CREATE POLICY "Users can delete their own messages" 
ON public_messages FOR DELETE 
USING (auth.role() = 'authenticated' AND user_id = auth.uid());
