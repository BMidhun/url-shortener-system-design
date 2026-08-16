CREATE TABLE "shortURLTableSchema"."shortURLTable" (
    -- Automatically increments by 1 for every new row
    id BIGINT GENERATED ALWAYS AS IDENTITY (START WITH 1) PRIMARY KEY,
    
    short_code VARCHAR(10) UNIQUE NOT NULL,
    long_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

SELECT * FROM "shortURLTableSchema"."shortURLTable" 
ORDER BY id ASC;

TRUNCATE TABLE "shortURLTableSchema"."shortURLTable" RESTART IDENTITY CASCADE;

ALTER TABLE "shortURLTableSchema"."shortURLTable" 
ADD CONSTRAINT unique_long_url UNIQUE (long_url);


-- Generate data in json format

SELECT json_agg(
    json_build_object(
        'short_code', short_code
    )
) AS json_output
FROM "shortURLTableSchema"."shortURLTable";